// ============================================================
// YYC3 — REST API Routes (Express + pg)
// All 15 endpoints with parameter validation
// ============================================================

import { Express, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

// === Parameter Validation Middleware ===

function validate(schema: Record<string, 'string' | 'number' | 'boolean' | 'array'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    for (const [key, type] of Object.entries(schema)) {
      if (body[key] === undefined) continue;
      if (type === 'array' && !Array.isArray(body[key])) {
        res.status(400).json({ error: `Field "${key}" must be an array` });

        return;
      }
      if (type !== 'array' && typeof body[key] !== type) {
        res.status(400).json({ error: `Field "${key}" must be ${type}, got ${typeof body[key]}` });

        return;
      }
    }
    next();
  };
}

function requireFields(...fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null) {
        res.status(400).json({ error: `Missing required field: "${field}"` });

        return;
      }
    }
    next();
  };
}

// === Route Factory ===

export function createRoutes(app: Express, pool: Pool): void {

  // ────────────────────────────────
  // SESSIONS
  // ────────────────────────────────

  // GET /sessions — List all sessions
  app.get('/api/v1/sessions', async (_req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM yyc3_sessions ORDER BY created_at DESC LIMIT 100',
      );

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /sessions — Create a new session
  app.post('/api/v1/sessions',
    requireFields('title'),
    validate({ title: 'string' }),
    async (req: Request, res: Response) => {
      try {
        const { title } = req.body;
        const { rows } = await pool.query(
          'INSERT INTO yyc3_sessions (title) VALUES ($1) RETURNING *',
          [title],
        );

        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // PATCH /sessions/:id/archive — Archive a session
  app.patch('/api/v1/sessions/:id/archive', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(
        'UPDATE yyc3_sessions SET is_archived = true WHERE id = $1 RETURNING *',
        [req.params.id],
      );

      if (rows.length === 0) {
        res.status(404).json({ error: 'Session not found' });

        return;
      }
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ────────────────────────────────
  // MESSAGES
  // ────────────────────────────────

  // GET /sessions/:id/messages — List session messages
  app.get('/api/v1/sessions/:id/messages', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM yyc3_messages WHERE session_id = $1 ORDER BY timestamp ASC',
        [req.params.id],
      );

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /sessions/:id/messages — Create a message
  app.post('/api/v1/sessions/:id/messages',
    requireFields('role', 'content'),
    validate({ role: 'string', content: 'string', agent_name: 'string', agent_role: 'string' }),
    async (req: Request, res: Response) => {
      try {
        const { role, content, agent_name, agent_role, timestamp } = req.body;
        const { rows } = await pool.query(
          `INSERT INTO yyc3_messages (session_id, role, content, agent_name, agent_role, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [req.params.id, role, content, agent_name || null, agent_role || null, timestamp || new Date()],
        );

        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // ────────────────────────────────
  // AGENT SESSIONS & MESSAGES
  // ────────────────────────────────

  // POST /agents/:agentId/session — Get or create active session
  app.post('/api/v1/agents/:agentId/session', async (req: Request, res: Response) => {
    try {
      const { agentId } = req.params;
      const { agent_name } = req.body;

      // Try to find existing active session
      const existing = await pool.query(
        'SELECT * FROM yyc3_agent_sessions WHERE agent_id = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1',
        [agentId],
      );

      if (existing.rows.length > 0) {
        res.json(existing.rows[0]);

        return;
      }

      // Create new session
      const { rows } = await pool.query(
        'INSERT INTO yyc3_agent_sessions (agent_id, agent_name) VALUES ($1, $2) RETURNING *',
        [agentId, agent_name || agentId],
      );

      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /agents/:agentId/session/reset — Reset agent session
  app.post('/api/v1/agents/:agentId/session/reset', async (req: Request, res: Response) => {
    try {
      await pool.query(
        'UPDATE yyc3_agent_sessions SET is_active = false WHERE agent_id = $1 AND is_active = true',
        [req.params.agentId],
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // GET /agents/:agentId/messages — List agent messages
  app.get('/api/v1/agents/:agentId/messages', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(
        `SELECT m.* FROM yyc3_agent_messages m
         JOIN yyc3_agent_sessions s ON m.session_id = s.id
         WHERE s.agent_id = $1 AND s.is_active = true
         ORDER BY m.timestamp ASC`,
        [req.params.agentId],
      );

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /agents/:agentId/messages — Create agent message
  app.post('/api/v1/agents/:agentId/messages',
    requireFields('role', 'content'),
    async (req: Request, res: Response) => {
      try {
        const { agentId } = req.params;
        const { role, content, timestamp } = req.body;

        // Get active session
        const session = await pool.query(
          'SELECT id FROM yyc3_agent_sessions WHERE agent_id = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1',
          [agentId],
        );

        if (session.rows.length === 0) {
          res.status(404).json({ error: 'No active session for this agent' });

          return;
        }

        const sessionId = session.rows[0].id;
        const { rows } = await pool.query(
          `INSERT INTO yyc3_agent_messages (session_id, agent_id, role, content, timestamp)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [sessionId, agentId, role, content, timestamp || new Date()],
        );

        // Update session counters
        await pool.query(
          'UPDATE yyc3_agent_sessions SET turn_count = turn_count + 1 WHERE id = $1',
          [sessionId],
        );

        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // ────────────────────────────────
  // METRICS
  // ────────────────────────────────

  // POST /metrics — Record metric point
  app.post('/api/v1/metrics',
    requireFields('node_id', 'metric_type', 'value'),
    validate({ node_id: 'string', metric_type: 'string', value: 'number', unit: 'string' }),
    async (req: Request, res: Response) => {
      try {
        const { node_id, metric_type, value, unit } = req.body;

        await pool.query(
          'INSERT INTO yyc3_metrics (node_id, metric_type, value, unit) VALUES ($1, $2, $3, $4)',
          [node_id, metric_type, value, unit || '%'],
        );
        res.status(201).json({ success: true });
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // GET /metrics — Query metrics
  app.get('/api/v1/metrics', async (req: Request, res: Response) => {
    try {
      const { node_id, metric_type, limit } = req.query;
      const limitVal = Math.min(parseInt(String(limit || '60'), 10), 500);

      const { rows } = await pool.query(
        `SELECT * FROM yyc3_metrics
         WHERE node_id = $1 AND metric_type = $2
         ORDER BY recorded_at DESC LIMIT $3`,
        [node_id, metric_type, limitVal],
      );

      res.json(rows.reverse());
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ────────────────────────────────
  // LOGS
  // ────────────────────────────────

  // GET /logs — List logs
  app.get('/api/v1/logs', async (req: Request, res: Response) => {
    try {
      const { limit, level } = req.query;
      const limitVal = Math.min(parseInt(String(limit || '50'), 10), 500);

      let query = 'SELECT * FROM yyc3_logs';
      const params: (string | number)[] = [];

      if (level) {
        query += ' WHERE level = $1';
        params.push(String(level));
      }

      query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
      params.push(limitVal);

      const { rows } = await pool.query(query, params);

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /logs — Create log entry
  app.post('/api/v1/logs',
    requireFields('level', 'source', 'message'),
    async (req: Request, res: Response) => {
      try {
        const { level, source, message } = req.body;
        const { rows } = await pool.query(
          'INSERT INTO yyc3_logs (level, source, message) VALUES ($1, $2, $3) RETURNING *',
          [level, source, message],
        );

        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // ────────────────────────────────
  // PROJECTS (CRUD)
  // ────────────────────────────────

  // GET /projects — List all projects
  app.get('/api/v1/projects', async (_req: Request, res: Response) => {
    try {
      const { rows } = await pool.query('SELECT * FROM yyc3_projects ORDER BY created_at DESC');

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // GET /projects/:id — Get project detail
  app.get('/api/v1/projects/:id', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query('SELECT * FROM yyc3_projects WHERE id = $1', [req.params.id]);

      if (rows.length === 0) {
        res.status(404).json({ error: 'Project not found' });

        return;
      }
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /projects — Create project
  app.post('/api/v1/projects',
    requireFields('name', 'project_type', 'language'),
    validate({ name: 'string', description: 'string', project_type: 'string', language: 'string' }),
    async (req: Request, res: Response) => {
      try {
        const { name, description, project_type, language, language_color, branch, status } = req.body;
        const { rows } = await pool.query(
          `INSERT INTO yyc3_projects (name, description, project_type, language, language_color, branch, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [name, description || '', project_type, language, language_color || 'bg-blue-500', branch || 'main', status || 'development'],
        );

        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // PUT /projects/:id — Update project
  app.put('/api/v1/projects/:id',
    validate({ name: 'string', description: 'string', status: 'string', health: 'string' }),
    async (req: Request, res: Response) => {
      try {
        const { name, description, status, health, branch, stars } = req.body;
        const { rows } = await pool.query(
          `UPDATE yyc3_projects SET
            name = COALESCE($2, name),
            description = COALESCE($3, description),
            status = COALESCE($4, status),
            health = COALESCE($5, health),
            branch = COALESCE($6, branch),
            stars = COALESCE($7, stars)
           WHERE id = $1 RETURNING *`,
          [req.params.id, name, description, status, health, branch, stars],
        );

        if (rows.length === 0) {
          res.status(404).json({ error: 'Project not found' });

          return;
        }
        res.json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // DELETE /projects/:id — Delete project
  app.delete('/api/v1/projects/:id', async (req: Request, res: Response) => {
    try {
      const { rowCount } = await pool.query('DELETE FROM yyc3_projects WHERE id = $1', [req.params.id]);

      if (rowCount === 0) {
        res.status(404).json({ error: 'Project not found' });

        return;
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ────────────────────────────────
  // ARTIFACTS (CRUD)
  // ────────────────────────────────

  // GET /artifacts — List all artifacts
  app.get('/api/v1/artifacts', async (req: Request, res: Response) => {
    try {
      const { type, starred } = req.query;
      let query = 'SELECT * FROM yyc3_artifacts WHERE 1=1';
      const params: (string | boolean)[] = [];

      if (type && type !== 'all') {
        params.push(String(type));
        query += ` AND artifact_type = $${params.length}`;
      }
      if (starred === 'true') {
        query += ' AND is_starred = true';
      }

      query += ' ORDER BY created_at DESC';
      const { rows } = await pool.query(query, params);

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // GET /artifacts/:id — Get artifact detail
  app.get('/api/v1/artifacts/:id', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query('SELECT * FROM yyc3_artifacts WHERE id = $1', [req.params.id]);

      if (rows.length === 0) {
        res.status(404).json({ error: 'Artifact not found' });

        return;
      }
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /artifacts — Create artifact
  app.post('/api/v1/artifacts',
    requireFields('title', 'artifact_type', 'language', 'content'),
    validate({ title: 'string', artifact_type: 'string', language: 'string', content: 'string' }),
    async (req: Request, res: Response) => {
      try {
        const { title, artifact_type, language, content, generated_by, agent_id, tags, version } = req.body;
        const size_bytes = new TextEncoder().encode(content).length;
        const { rows } = await pool.query(
          `INSERT INTO yyc3_artifacts (title, artifact_type, language, content, size_bytes, generated_by, agent_id, tags, version)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [title, artifact_type, language, content, size_bytes, generated_by || null, agent_id || null, tags || [], version || 'v1.0'],
        );

        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // PUT /artifacts/:id — Update artifact
  app.put('/api/v1/artifacts/:id', async (req: Request, res: Response) => {
    try {
      const { title, content, tags, version, is_starred } = req.body;
      const size_bytes = content ? new TextEncoder().encode(content).length : undefined;
      const { rows } = await pool.query(
        `UPDATE yyc3_artifacts SET
          title = COALESCE($2, title),
          content = COALESCE($3, content),
          size_bytes = COALESCE($4, size_bytes),
          tags = COALESCE($5, tags),
          version = COALESCE($6, version),
          is_starred = COALESCE($7, is_starred)
         WHERE id = $1 RETURNING *`,
        [req.params.id, title, content, size_bytes, tags, version, is_starred],
      );

      if (rows.length === 0) {
        res.status(404).json({ error: 'Artifact not found' });

        return;
      }
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // DELETE /artifacts/:id — Delete artifact
  app.delete('/api/v1/artifacts/:id', async (req: Request, res: Response) => {
    try {
      const { rowCount } = await pool.query('DELETE FROM yyc3_artifacts WHERE id = $1', [req.params.id]);

      if (rowCount === 0) {
        res.status(404).json({ error: 'Artifact not found' });

        return;
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // PATCH /artifacts/:id/star — Toggle star
  app.patch('/api/v1/artifacts/:id/star', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(
        'UPDATE yyc3_artifacts SET is_starred = NOT is_starred WHERE id = $1 RETURNING *',
        [req.params.id],
      );

      if (rows.length === 0) {
        res.status(404).json({ error: 'Artifact not found' });

        return;
      }
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ────────────────────────────────
  // PREFERENCES
  // ────────────────────────────────

  app.get('/api/v1/preferences/:key', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query('SELECT value FROM yyc3_preferences WHERE key = $1', [req.params.key]);

      if (rows.length === 0) {
        res.status(404).json({ error: 'Preference not found' });

        return;
      }
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.put('/api/v1/preferences/:key',
    requireFields('value'),
    async (req: Request, res: Response) => {
      try {
        await pool.query(
          `INSERT INTO yyc3_preferences (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
          [req.params.key, JSON.stringify(req.body.value)],
        );
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    },
  );

  // ────────────────────────────────
  // CLUSTER NODES
  // ────────────────────────────────

  app.get('/api/v1/nodes', async (_req: Request, res: Response) => {
    try {
      const { rows } = await pool.query('SELECT * FROM yyc3_nodes ORDER BY display_name');

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Heartbeat update
  app.post('/api/v1/nodes/:id/heartbeat', async (req: Request, res: Response) => {
    try {
      await pool.query(
        'UPDATE yyc3_nodes SET last_heartbeat = NOW(), status = $2 WHERE id = $1',
        [req.params.id, req.body.status || 'online'],
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
}
