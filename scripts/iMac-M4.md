# iMac 192.168.3.77 (yyc3-77)

time=2026-02-25T18:13:51.325+08:00 level=INFO source=routes.go:1663 msg="server config" env="map[HTTPS_PROXY: HTTP_PROXY: NO_PROXY: OLLAMA_CONTEXT_LENGTH:0 OLLAMA_DEBUG:INFO OLLAMA_EDITOR: OLLAMA_FLASH_ATTENTION:false OLLAMA_GPU_OVERHEAD:0 OLLAMA_HOST:http://0.0.0.0:11434 OLLAMA_KEEP_ALIVE:5m0s OLLAMA_KV_CACHE_TYPE: OLLAMA_LLM_LIBRARY: OLLAMA_LOAD_TIMEOUT:5m0s OLLAMA_MAX_LOADED_MODELS:0 OLLAMA_MAX_QUEUE:512 OLLAMA_MODELS:/Users/my/.ollama/models OLLAMA_MULTIUSER_CACHE:false OLLAMA_NEW_ENGINE:false OLLAMA_NOHISTORY:false OLLAMA_NOPRUNE:false OLLAMA_NO_CLOUD:false OLLAMA_NUM_PARALLEL:1 OLLAMA_ORIGINS:[http://localhost:3113 http://192.168.3.22:3113 http://localhost https://localhost http://localhost:* https://localhost:* http://127.0.0.1 https://127.0.0.1 http://127.0.0.1:* https://127.0.0.1:* http://0.0.0.0 https://0.0.0.0 http://0.0.0.0:* https://0.0.0.0:* app://* file://* tauri://* vscode-webview://* vscode-file://*] OLLAMA_REMOTES:[ollama.com] OLLAMA_SCHED_SPREAD:false http_proxy: https_proxy: no_proxy:]"
time=2026-02-25T18:13:51.325+08:00 level=INFO source=routes.go:1665 msg="Ollama cloud disabled: false"
time=2026-02-25T18:13:51.327+08:00 level=INFO source=images.go:473 msg="total blobs: 15"
time=2026-02-25T18:13:51.327+08:00 level=INFO source=images.go:480 msg="total unused blobs removed: 0"
time=2026-02-25T18:13:51.328+08:00 level=INFO source=routes.go:1718 msg="Listening on [::]:11434 (version 0.17.0)"
time=2026-02-25T18:13:51.328+08:00 level=INFO source=runner.go:67 msg="discovering available GPUs..."
time=2026-02-25T18:13:51.328+08:00 level=INFO source=server.go:431 msg="starting runner" cmd="/opt/homebrew/Cellar/ollama/0.17.0/bin/ollama runner --ollama-engine --port 54544"
time=2026-02-25T18:13:51.833+08:00 level=INFO source=types.go:42 msg="inference compute" id=0 filter_id=0 library=Metal compute=0.0 name=Metal description="Apple M4" libdirs="" driver=0.0 pci_id="" type=discrete total="25.0 GiB" available="25.0 GiB"
time=2026-02-25T18:13:51.833+08:00 level=INFO source=routes.go:1768 msg="vram-based default context" total_vram="25.0 GiB" default_num_ctx=32768
[GIN] 2026/02/25 - 18:14:21 | 200 |     154.625µs |    192.168.3.22 | GET      "/api/version"
[GIN] 2026/02/25 - 18:14:21 | 200 |    1.445958ms |    192.168.3.22 | GET      "/api/tags"
[GIN] 2026/02/25 - 18:14:27 | 200 |    2.211583ms |    192.168.3.22 | GET      "/api/tags"
ggml_metal_device_init: tensor API disabled for pre-M5 and pre-A19 devices
ggml_metal_library_init: using embedded metal library
ggml_metal_library_init: loaded in 6.996 sec
ggml_metal_rsets_init: creating a residency set collection (keep_alive = 180 s)
ggml_metal_device_init: GPU name:   Apple M4
ggml_metal_device_init: GPU family: MTLGPUFamilyApple9  (1009)
ggml_metal_device_init: GPU family: MTLGPUFamilyCommon3 (3003)
ggml_metal_device_init: GPU family: MTLGPUFamilyMetal4  (5002)
ggml_metal_device_init: simdgroup reduction   = true
ggml_metal_device_init: simdgroup matrix mul. = true
ggml_metal_device_init: has unified memory    = true
ggml_metal_device_init: has bfloat            = true
ggml_metal_device_init: has tensor            = false
ggml_metal_device_init: use residency sets    = true
ggml_metal_device_init: use shared buffers    = true
ggml_metal_device_init: recommendedMaxWorkingSetSize  = 26800.60 MB
llama_model_load_from_file_impl: using device Metal (Apple M4) (unknown id) - 25557 MiB free
llama_model_loader: loaded meta data with 23 key-value pairs and 283 tensors from /Users/my/.ollama/models/blobs/sha256-816441b33390807d429fbdb1de7e33bb4d569ac68e2203bdbca5d8d79b5c7266 (version GGUF V3 (latest))
llama_model_loader: Dumping metadata keys/values. Note: KV overrides do not apply in this output.
llama_model_loader: - kv   0:                       general.architecture str              = chatglm
llama_model_loader: - kv   1:                               general.name str              = codegeex4-all-9b
llama_model_loader: - kv   2:                     chatglm.context_length u32              = 131072
llama_model_loader: - kv   3:                   chatglm.embedding_length u32              = 4096
llama_model_loader: - kv   4:                chatglm.feed_forward_length u32              = 13696
llama_model_loader: - kv   5:                        chatglm.block_count u32              = 40
llama_model_loader: - kv   6:               chatglm.attention.head_count u32              = 32
llama_model_loader: - kv   7:            chatglm.attention.head_count_kv u32              = 2
llama_model_loader: - kv   8:   chatglm.attention.layer_norm_rms_epsilon f32              = 0.000010
llama_model_loader: - kv   9:                          general.file_type u32              = 2
llama_model_loader: - kv  10:               chatglm.rope.dimension_count u32              = 64
llama_model_loader: - kv  11:               tokenizer.ggml.add_bos_token bool             = false
llama_model_loader: - kv  12:                     chatglm.rope.freq_base f32              = 5000000.000000
llama_model_loader: - kv  13:                       tokenizer.ggml.model str              = gpt2
llama_model_loader: - kv  14:                         tokenizer.ggml.pre str              = chatglm-bpe
llama_model_loader: - kv  15:                      tokenizer.ggml.tokens arr[str,151552]  = ["!", "\"", "#", "$", "%", "&", "'", ...
llama_model_loader: - kv  16:                  tokenizer.ggml.token_type arr[i32,151552]  = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ...
llama_model_loader: - kv  17:                      tokenizer.ggml.merges arr[str,151073]  = ["Ġ Ġ", "ĠĠ ĠĠ", "i n", "Ġ t",...
llama_model_loader: - kv  18:            tokenizer.ggml.padding_token_id u32              = 151329
llama_model_loader: - kv  19:                tokenizer.ggml.eos_token_id u32              = 151329
llama_model_loader: - kv  20:                tokenizer.ggml.eot_token_id u32              = 151336
llama_model_loader: - kv  21:            tokenizer.ggml.unknown_token_id u32              = 151329
llama_model_loader: - kv  22:               general.quantization_version u32              = 2
llama_model_loader: - type  f32:  121 tensors
llama_model_loader: - type q4_0:  161 tensors
llama_model_loader: - type q6_K:    1 tensors
print_info: file format = GGUF V3 (latest)
print_info: file type   = Q4_0
print_info: file size   = 5.08 GiB (4.64 BPW) 
load: control-looking token: 151345 '<|code_suffix|>' was not control-type; this is probably a bug in the model. its type will be overridden
load: control-looking token: 151344 '<|code_middle|>' was not control-type; this is probably a bug in the model. its type will be overridden
load: control-looking token: 151343 '<|code_prefix|>' was not control-type; this is probably a bug in the model. its type will be overridden
load: special_eot_id is not in special_eog_ids - the tokenizer config may be incorrect
load: printing all EOG tokens:
load:   - 151329 ('<|endoftext|>')
load:   - 151336 ('<|user|>')
load: special tokens cache size = 223
load: token to piece cache size = 0.9732 MB
print_info: arch             = chatglm
print_info: vocab_only       = 1
print_info: no_alloc         = 0
print_info: model type       = ?B
print_info: model params     = 9.40 B
print_info: general.name     = codegeex4-all-9b
print_info: vocab type       = BPE
print_info: n_vocab          = 151552
print_info: n_merges         = 151073
print_info: EOS token        = 151329 '<|endoftext|>'
print_info: EOT token        = 151336 '<|user|>'
print_info: UNK token        = 151329 '<|endoftext|>'
print_info: PAD token        = 151329 '<|endoftext|>'
print_info: LF token         = 198 'Ċ'
print_info: FIM PRE token    = 151343 '<|code_prefix|>'
print_info: FIM SUF token    = 151345 '<|code_suffix|>'
print_info: FIM MID token    = 151344 '<|code_middle|>'
print_info: EOG token        = 151329 '<|endoftext|>'
print_info: EOG token        = 151336 '<|user|>'
print_info: max token length = 1024
llama_model_load: vocab only - skipping tensors
time=2026-02-25T18:14:34.258+08:00 level=INFO source=server.go:431 msg="starting runner" cmd="/opt/homebrew/Cellar/ollama/0.17.0/bin/ollama runner --model /Users/my/.ollama/models/blobs/sha256-816441b33390807d429fbdb1de7e33bb4d569ac68e2203bdbca5d8d79b5c7266 --port 54686"
time=2026-02-25T18:14:34.262+08:00 level=INFO source=sched.go:491 msg="system memory" total="32.0 GiB" free="13.8 GiB" free_swap="0 B"
time=2026-02-25T18:14:34.262+08:00 level=INFO source=sched.go:498 msg="gpu memory" id=0 library=Metal available="24.5 GiB" free="25.0 GiB" minimum="512.0 MiB" overhead="0 B"
time=2026-02-25T18:14:34.262+08:00 level=INFO source=server.go:498 msg="loading model" "model layers"=41 requested=-1
time=2026-02-25T18:14:34.262+08:00 level=INFO source=device.go:240 msg="model weights" device=Metal size="4.7 GiB"
time=2026-02-25T18:14:34.262+08:00 level=INFO source=device.go:251 msg="kv cache" device=Metal size="1.2 GiB"
time=2026-02-25T18:14:34.262+08:00 level=INFO source=device.go:262 msg="compute graph" device=Metal size="2.1 GiB"
time=2026-02-25T18:14:34.262+08:00 level=INFO source=device.go:272 msg="total memory" size="8.1 GiB"
time=2026-02-25T18:14:34.303+08:00 level=INFO source=runner.go:965 msg="starting go runner"
ggml_metal_device_init: tensor API disabled for pre-M5 and pre-A19 devices
ggml_metal_library_init: using embedded metal library
ggml_metal_library_init: loaded in 6.664 sec
ggml_metal_rsets_init: creating a residency set collection (keep_alive = 180 s)
ggml_metal_device_init: GPU name:   Apple M4
ggml_metal_device_init: GPU family: MTLGPUFamilyApple9  (1009)
ggml_metal_device_init: GPU family: MTLGPUFamilyCommon3 (3003)
ggml_metal_device_init: GPU family: MTLGPUFamilyMetal4  (5002)
ggml_metal_device_init: simdgroup reduction   = true
ggml_metal_device_init: simdgroup matrix mul. = true
ggml_metal_device_init: has unified memory    = true
ggml_metal_device_init: has bfloat            = true
ggml_metal_device_init: has tensor            = false
ggml_metal_device_init: use residency sets    = true
ggml_metal_device_init: use shared buffers    = true
ggml_metal_device_init: recommendedMaxWorkingSetSize  = 26800.60 MB
time=2026-02-25T18:14:34.303+08:00 level=INFO source=ggml.go:104 msg=system Metal.0.EMBED_LIBRARY=1 CPU.0.NEON=1 CPU.0.ARM_FMA=1 CPU.0.FP16_VA=1 CPU.0.DOTPROD=1 CPU.0.LLAMAFILE=1 CPU.0.ACCELERATE=1 compiler=cgo(clang)
time=2026-02-25T18:14:40.982+08:00 level=INFO source=runner.go:1001 msg="Server listening on 127.0.0.1:54686"
time=2026-02-25T18:14:40.986+08:00 level=INFO source=runner.go:895 msg=load request="{Operation:commit LoraPath:[] Parallel:1 BatchSize:512 FlashAttention:Auto KvSize:32768 KvCacheType: NumThreads:4 GPULayers:41[ID:0 Layers:41(0..40)] MultiUserCache:false ProjectorPath: MainGPU:0 UseMmap:true}"
llama_model_load_from_file_impl: using device Metal (Apple M4) (unknown id) - 25557 MiB free
time=2026-02-25T18:14:40.986+08:00 level=INFO source=server.go:1350 msg="waiting for llama runner to start responding"
time=2026-02-25T18:14:40.986+08:00 level=INFO source=server.go:1384 msg="waiting for server to become available" status="llm server loading model"
llama_model_loader: loaded meta data with 23 key-value pairs and 283 tensors from /Users/my/.ollama/models/blobs/sha256-816441b33390807d429fbdb1de7e33bb4d569ac68e2203bdbca5d8d79b5c7266 (version GGUF V3 (latest))
llama_model_loader: Dumping metadata keys/values. Note: KV overrides do not apply in this output.
llama_model_loader: - kv   0:                       general.architecture str              = chatglm
llama_model_loader: - kv   1:                               general.name str              = codegeex4-all-9b
llama_model_loader: - kv   2:                     chatglm.context_length u32              = 131072
llama_model_loader: - kv   3:                   chatglm.embedding_length u32              = 4096
llama_model_loader: - kv   4:                chatglm.feed_forward_length u32              = 13696
llama_model_loader: - kv   5:                        chatglm.block_count u32              = 40
llama_model_loader: - kv   6:               chatglm.attention.head_count u32              = 32
llama_model_loader: - kv   7:            chatglm.attention.head_count_kv u32              = 2
llama_model_loader: - kv   8:   chatglm.attention.layer_norm_rms_epsilon f32              = 0.000010
llama_model_loader: - kv   9:                          general.file_type u32              = 2
llama_model_loader: - kv  10:               chatglm.rope.dimension_count u32              = 64
llama_model_loader: - kv  11:               tokenizer.ggml.add_bos_token bool             = false
llama_model_loader: - kv  12:                     chatglm.rope.freq_base f32              = 5000000.000000
llama_model_loader: - kv  13:                       tokenizer.ggml.model str              = gpt2
llama_model_loader: - kv  14:                         tokenizer.ggml.pre str              = chatglm-bpe
llama_model_loader: - kv  15:                      tokenizer.ggml.tokens arr[str,151552]  = ["!", "\"", "#", "$", "%", "&", "'", ...
llama_model_loader: - kv  16:                  tokenizer.ggml.token_type arr[i32,151552]  = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ...
llama_model_loader: - kv  17:                      tokenizer.ggml.merges arr[str,151073]  = ["Ġ Ġ", "ĠĠ ĠĠ", "i n", "Ġ t",...
llama_model_loader: - kv  18:            tokenizer.ggml.padding_token_id u32              = 151329
llama_model_loader: - kv  19:                tokenizer.ggml.eos_token_id u32              = 151329
llama_model_loader: - kv  20:                tokenizer.ggml.eot_token_id u32              = 151336
llama_model_loader: - kv  21:            tokenizer.ggml.unknown_token_id u32              = 151329
llama_model_loader: - kv  22:               general.quantization_version u32              = 2
llama_model_loader: - type  f32:  121 tensors
llama_model_loader: - type q4_0:  161 tensors
llama_model_loader: - type q6_K:    1 tensors
print_info: file format = GGUF V3 (latest)
print_info: file type   = Q4_0
print_info: file size   = 5.08 GiB (4.64 BPW) 
load: control-looking token: 151345 '<|code_suffix|>' was not control-type; this is probably a bug in the model. its type will be overridden
load: control-looking token: 151344 '<|code_middle|>' was not control-type; this is probably a bug in the model. its type will be overridden
load: control-looking token: 151343 '<|code_prefix|>' was not control-type; this is probably a bug in the model. its type will be overridden
load: special_eot_id is not in special_eog_ids - the tokenizer config may be incorrect
load: printing all EOG tokens:
load:   - 151329 ('<|endoftext|>')
load:   - 151336 ('<|user|>')
load: special tokens cache size = 223
load: token to piece cache size = 0.9732 MB
print_info: arch             = chatglm
print_info: vocab_only       = 0
print_info: no_alloc         = 0
print_info: n_ctx_train      = 131072
print_info: n_embd           = 4096
print_info: n_embd_inp       = 4096
print_info: n_layer          = 40
print_info: n_head           = 32
print_info: n_head_kv        = 2
print_info: n_rot            = 64
print_info: n_swa            = 0
print_info: is_swa_any       = 0
print_info: n_embd_head_k    = 128
print_info: n_embd_head_v    = 128
print_info: n_gqa            = 16
print_info: n_embd_k_gqa     = 256
print_info: n_embd_v_gqa     = 256
print_info: f_norm_eps       = 0.0e+00
print_info: f_norm_rms_eps   = 1.0e-05
print_info: f_clamp_kqv      = 0.0e+00
print_info: f_max_alibi_bias = 0.0e+00
print_info: f_logit_scale    = 0.0e+00
print_info: f_attn_scale     = 0.0e+00
print_info: n_ff             = 13696
print_info: n_expert         = 0
print_info: n_expert_used    = 0
print_info: n_expert_groups  = 0
print_info: n_group_used     = 0
print_info: causal attn      = 1
print_info: pooling type     = 0
print_info: rope type        = 0
print_info: rope scaling     = linear
print_info: freq_base_train  = 5000000.0
print_info: freq_scale_train = 1
print_info: n_ctx_orig_yarn  = 131072
print_info: rope_yarn_log_mul= 0.0000
print_info: rope_finetuned   = unknown
print_info: model type       = 9B
print_info: model params     = 9.40 B
print_info: general.name     = codegeex4-all-9b
print_info: vocab type       = BPE
print_info: n_vocab          = 151552
print_info: n_merges         = 151073
print_info: EOS token        = 151329 '<|endoftext|>'
print_info: EOT token        = 151336 '<|user|>'
print_info: UNK token        = 151329 '<|endoftext|>'
print_info: PAD token        = 151329 '<|endoftext|>'
print_info: LF token         = 198 'Ċ'
print_info: FIM PRE token    = 151343 '<|code_prefix|>'
print_info: FIM SUF token    = 151345 '<|code_suffix|>'
print_info: FIM MID token    = 151344 '<|code_middle|>'
print_info: EOG token        = 151329 '<|endoftext|>'
print_info: EOG token        = 151336 '<|user|>'
print_info: max token length = 1024
load_tensors: loading model tensors, this can take a while... (mmap = true)
load_tensors: offloading 40 repeating layers to GPU
load_tensors: offloading output layer to GPU
load_tensors: offloaded 41/41 layers to GPU
load_tensors:   CPU_Mapped model buffer size =   333.00 MiB
load_tensors: Metal_Mapped model buffer size =  4863.84 MiB
llama_context: constructing llama_context
llama_context: n_seq_max     = 1
llama_context: n_ctx         = 32768
llama_context: n_ctx_seq     = 32768
llama_context: n_batch       = 512
llama_context: n_ubatch      = 512
llama_context: causal_attn   = 1
llama_context: flash_attn    = auto
llama_context: kv_unified    = false
llama_context: freq_base     = 5000000.0
llama_context: freq_scale    = 1
llama_context: n_ctx_seq (32768) < n_ctx_train (131072) -- the full capacity of the model will not be utilized
ggml_metal_init: allocating
ggml_metal_init: picking default device: Apple M4
ggml_metal_init: use fusion         = true
ggml_metal_init: use concurrency    = true
ggml_metal_init: use graph optimize = true
llama_context:        CPU  output buffer size =     0.59 MiB
llama_kv_cache:      Metal KV buffer size =  1280.00 MiB
llama_kv_cache: size = 1280.00 MiB ( 32768 cells,  40 layers,  1/1 seqs), K (f16):  640.00 MiB, V (f16):  640.00 MiB
llama_context: Flash Attention was auto, set to enabled
llama_context:      Metal compute buffer size =   304.00 MiB
llama_context:        CPU compute buffer size =    72.01 MiB
llama_context: graph nodes  = 1167
llama_context: graph splits = 2
time=2026-02-25T18:14:44.253+08:00 level=INFO source=server.go:1388 msg="llama runner started in 9.99 seconds"
time=2026-02-25T18:14:44.253+08:00 level=INFO source=sched.go:566 msg="loaded runners" count=1
time=2026-02-25T18:14:44.253+08:00 level=INFO source=server.go:1350 msg="waiting for llama runner to start responding"
time=2026-02-25T18:14:44.253+08:00 level=INFO source=server.go:1388 msg="llama runner started in 9.99 seconds"
[GIN] 2026/02/25 - 18:14:52 | 200 | 25.362564666s |    192.168.3.22 | POST     "/api/generate"
[GIN] 2026/02/25 - 18:14:52 | 200 |    2.433084ms |    192.168.3.22 | GET      "/api/tags"
[GIN] 2026/02/25 - 18:14:52 | 200 |     462.583µs |    192.168.3.22 | GET      "/api/tags"
time=2026-02-25T18:14:52.494+08:00 level=INFO source=sched.go:689 msg="updated VRAM based on existing loaded models" gpu=0 library=Metal total="25.0 GiB" available="16.9 GiB"
llama_model_load_from_file_impl: using device Metal (Apple M4) (unknown id) - 25557 MiB free
llama_model_loader: loaded meta data with 36 key-value pairs and 197 tensors from /Users/my/.ollama/models/blobs/sha256-633fc5be925f9a484b61d6f9b9a78021eeb462100bd557309f01ba84cac26adf (version GGUF V3 (latest))
llama_model_loader: Dumping metadata keys/values. Note: KV overrides do not apply in this output.
llama_model_loader: - kv   0:                       general.architecture str              = phi3
llama_model_loader: - kv   1:                               general.type str              = model
llama_model_loader: - kv   2:                               general.name str              = Phi 3 Mini 128k Instruct
llama_model_loader: - kv   3:                           general.finetune str              = 128k-instruct
llama_model_loader: - kv   4:                           general.basename str              = Phi-3
llama_model_loader: - kv   5:                         general.size_label str              = mini
llama_model_loader: - kv   6:                            general.license str              = mit
llama_model_loader: - kv   7:                       general.license.link str              = https://huggingface.co/microsoft/Phi-...
llama_model_loader: - kv   8:                               general.tags arr[str,3]       = ["nlp", "code", "text-generation"]
llama_model_loader: - kv   9:                          general.languages arr[str,1]       = ["en"]
llama_model_loader: - kv  10:                        phi3.context_length u32              = 131072
llama_model_loader: - kv  11:  phi3.rope.scaling.original_context_length u32              = 4096
llama_model_loader: - kv  12:                      phi3.embedding_length u32              = 3072
llama_model_loader: - kv  13:                   phi3.feed_forward_length u32              = 8192
llama_model_loader: - kv  14:                           phi3.block_count u32              = 32
llama_model_loader: - kv  15:                  phi3.attention.head_count u32              = 32
llama_model_loader: - kv  16:               phi3.attention.head_count_kv u32              = 32
llama_model_loader: - kv  17:      phi3.attention.layer_norm_rms_epsilon f32              = 0.000010
llama_model_loader: - kv  18:                  phi3.rope.dimension_count u32              = 96
llama_model_loader: - kv  19:                        phi3.rope.freq_base f32              = 10000.000000
llama_model_loader: - kv  20:                          general.file_type u32              = 2
llama_model_loader: - kv  21:              phi3.attention.sliding_window u32              = 262144
llama_model_loader: - kv  22:              phi3.rope.scaling.attn_factor f32              = 1.190238
llama_model_loader: - kv  23:                       tokenizer.ggml.model str              = llama
llama_model_loader: - kv  24:                         tokenizer.ggml.pre str              = default
llama_model_loader: - kv  25:                      tokenizer.ggml.tokens arr[str,32064]   = ["<unk>", "<s>", "</s>", "<0x00>", "<...
llama_model_loader: - kv  26:                      tokenizer.ggml.scores arr[f32,32064]   = [-1000.000000, -1000.000000, -1000.00...
llama_model_loader: - kv  27:                  tokenizer.ggml.token_type arr[i32,32064]   = [3, 3, 4, 6, 6, 6, 6, 6, 6, 6, 6, 6, ...
llama_model_loader: - kv  28:                tokenizer.ggml.bos_token_id u32              = 1
llama_model_loader: - kv  29:                tokenizer.ggml.eos_token_id u32              = 32000
llama_model_loader: - kv  30:            tokenizer.ggml.unknown_token_id u32              = 0
llama_model_loader: - kv  31:            tokenizer.ggml.padding_token_id u32              = 32000
llama_model_loader: - kv  32:               tokenizer.ggml.add_bos_token bool             = false
llama_model_loader: - kv  33:               tokenizer.ggml.add_eos_token bool             = false
llama_model_loader: - kv  34:                    tokenizer.chat_template str              = {% for message in messages %}{% if me...
llama_model_loader: - kv  35:               general.quantization_version u32              = 2
llama_model_loader: - type  f32:   67 tensors
llama_model_loader: - type q4_0:  129 tensors
llama_model_loader: - type q6_K:    1 tensors
print_info: file format = GGUF V3 (latest)
print_info: file type   = Q4_0
print_info: file size   = 2.03 GiB (4.55 BPW) 
load: printing all EOG tokens:
load:   - 32000 ('<|endoftext|>')
load:   - 32007 ('<|end|>')
load: special tokens cache size = 14
load: token to piece cache size = 0.1685 MB
print_info: arch             = phi3
print_info: vocab_only       = 1
print_info: no_alloc         = 0
print_info: model type       = ?B
print_info: model params     = 3.82 B
print_info: general.name     = Phi 3 Mini 128k Instruct
print_info: vocab type       = SPM
print_info: n_vocab          = 32064
print_info: n_merges         = 0
print_info: BOS token        = 1 '<s>'
print_info: EOS token        = 32000 '<|endoftext|>'
print_info: EOT token        = 32007 '<|end|>'
print_info: UNK token        = 0 '<unk>'
print_info: PAD token        = 32000 '<|endoftext|>'
print_info: LF token         = 13 '<0x0A>'
print_info: EOG token        = 32000 '<|endoftext|>'
print_info: EOG token        = 32007 '<|end|>'
print_info: max token length = 48
llama_model_load: vocab only - skipping tensors
time=2026-02-25T18:14:52.525+08:00 level=INFO source=server.go:431 msg="starting runner" cmd="/opt/homebrew/Cellar/ollama/0.17.0/bin/ollama runner --model /Users/my/.ollama/models/blobs/sha256-633fc5be925f9a484b61d6f9b9a78021eeb462100bd557309f01ba84cac26adf --port 55334"
time=2026-02-25T18:14:52.528+08:00 level=INFO source=sched.go:491 msg="system memory" total="32.0 GiB" free="10.9 GiB" free_swap="0 B"
time=2026-02-25T18:14:52.528+08:00 level=INFO source=sched.go:498 msg="gpu memory" id=0 library=Metal available="16.4 GiB" free="16.9 GiB" minimum="512.0 MiB" overhead="0 B"
time=2026-02-25T18:14:52.528+08:00 level=INFO source=server.go:498 msg="loading model" "model layers"=33 requested=-1
time=2026-02-25T18:14:52.529+08:00 level=INFO source=server.go:1029 msg="model requires more gpu memory than is currently available, evicting a model to make space" "loaded layers"=32
time=2026-02-25T18:14:52.585+08:00 level=INFO source=sched.go:491 msg="system memory" total="32.0 GiB" free="11.0 GiB" free_swap="0 B"
time=2026-02-25T18:14:52.585+08:00 level=INFO source=sched.go:498 msg="gpu memory" id=0 library=Metal available="24.5 GiB" free="25.0 GiB" minimum="512.0 MiB" overhead="0 B"
time=2026-02-25T18:14:52.585+08:00 level=INFO source=server.go:498 msg="loading model" "model layers"=33 requested=-1
time=2026-02-25T18:14:52.585+08:00 level=INFO source=device.go:240 msg="model weights" device=Metal size="2.0 GiB"
time=2026-02-25T18:14:52.585+08:00 level=INFO source=device.go:251 msg="kv cache" device=Metal size="12.0 GiB"
time=2026-02-25T18:14:52.585+08:00 level=INFO source=device.go:262 msg="compute graph" device=Metal size="2.0 GiB"
time=2026-02-25T18:14:52.585+08:00 level=INFO source=device.go:272 msg="total memory" size="16.0 GiB"
time=2026-02-25T18:14:52.598+08:00 level=INFO source=runner.go:965 msg="starting go runner"
ggml_metal_device_init: tensor API disabled for pre-M5 and pre-A19 devices
ggml_metal_library_init: using embedded metal library
ggml_metal_library_init: loaded in 0.021 sec
ggml_metal_rsets_init: creating a residency set collection (keep_alive = 180 s)
ggml_metal_device_init: GPU name:   Apple M4
ggml_metal_device_init: GPU family: MTLGPUFamilyApple9  (1009)
ggml_metal_device_init: GPU family: MTLGPUFamilyCommon3 (3003)
ggml_metal_device_init: GPU family: MTLGPUFamilyMetal4  (5002)
ggml_metal_device_init: simdgroup reduction   = true
ggml_metal_device_init: simdgroup matrix mul. = true
ggml_metal_device_init: has unified memory    = true
ggml_metal_device_init: has bfloat            = true
ggml_metal_device_init: has tensor            = false
ggml_metal_device_init: use residency sets    = true
ggml_metal_device_init: use shared buffers    = true
ggml_metal_device_init: recommendedMaxWorkingSetSize  = 26800.60 MB
time=2026-02-25T18:14:52.599+08:00 level=INFO source=ggml.go:104 msg=system Metal.0.EMBED_LIBRARY=1 CPU.0.NEON=1 CPU.0.ARM_FMA=1 CPU.0.FP16_VA=1 CPU.0.DOTPROD=1 CPU.0.LLAMAFILE=1 CPU.0.ACCELERATE=1 compiler=cgo(clang)
time=2026-02-25T18:14:52.639+08:00 level=INFO source=runner.go:1001 msg="Server listening on 127.0.0.1:55334"
time=2026-02-25T18:14:52.650+08:00 level=INFO source=runner.go:895 msg=load request="{Operation:commit LoraPath:[] Parallel:1 BatchSize:512 FlashAttention:Auto KvSize:32768 KvCacheType: NumThreads:4 GPULayers:33[ID:0 Layers:33(0..32)] MultiUserCache:false ProjectorPath: MainGPU:0 UseMmap:true}"
llama_model_load_from_file_impl: using device Metal (Apple M4) (unknown id) - 25557 MiB free
time=2026-02-25T18:14:52.650+08:00 level=INFO source=server.go:1350 msg="waiting for llama runner to start responding"
time=2026-02-25T18:14:52.651+08:00 level=INFO source=server.go:1384 msg="waiting for server to become available" status="llm server loading model"
llama_model_loader: loaded meta data with 36 key-value pairs and 197 tensors from /Users/my/.ollama/models/blobs/sha256-633fc5be925f9a484b61d6f9b9a78021eeb462100bd557309f01ba84cac26adf (version GGUF V3 (latest))
llama_model_loader: Dumping metadata keys/values. Note: KV overrides do not apply in this output.
llama_model_loader: - kv   0:                       general.architecture str              = phi3
llama_model_loader: - kv   1:                               general.type str              = model
llama_model_loader: - kv   2:                               general.name str              = Phi 3 Mini 128k Instruct
llama_model_loader: - kv   3:                           general.finetune str              = 128k-instruct
llama_model_loader: - kv   4:                           general.basename str              = Phi-3
llama_model_loader: - kv   5:                         general.size_label str              = mini
llama_model_loader: - kv   6:                            general.license str              = mit
llama_model_loader: - kv   7:                       general.license.link str              = https://huggingface.co/microsoft/Phi-...
llama_model_loader: - kv   8:                               general.tags arr[str,3]       = ["nlp", "code", "text-generation"]
llama_model_loader: - kv   9:                          general.languages arr[str,1]       = ["en"]
llama_model_loader: - kv  10:                        phi3.context_length u32              = 131072
llama_model_loader: - kv  11:  phi3.rope.scaling.original_context_length u32              = 4096
llama_model_loader: - kv  12:                      phi3.embedding_length u32              = 3072
llama_model_loader: - kv  13:                   phi3.feed_forward_length u32              = 8192
llama_model_loader: - kv  14:                           phi3.block_count u32              = 32
llama_model_loader: - kv  15:                  phi3.attention.head_count u32              = 32
llama_model_loader: - kv  16:               phi3.attention.head_count_kv u32              = 32
llama_model_loader: - kv  17:      phi3.attention.layer_norm_rms_epsilon f32              = 0.000010
llama_model_loader: - kv  18:                  phi3.rope.dimension_count u32              = 96
llama_model_loader: - kv  19:                        phi3.rope.freq_base f32              = 10000.000000
llama_model_loader: - kv  20:                          general.file_type u32              = 2
llama_model_loader: - kv  21:              phi3.attention.sliding_window u32              = 262144
llama_model_loader: - kv  22:              phi3.rope.scaling.attn_factor f32              = 1.190238
llama_model_loader: - kv  23:                       tokenizer.ggml.model str              = llama
llama_model_loader: - kv  24:                         tokenizer.ggml.pre str              = default
llama_model_loader: - kv  25:                      tokenizer.ggml.tokens arr[str,32064]   = ["<unk>", "<s>", "</s>", "<0x00>", "<...
llama_model_loader: - kv  26:                      tokenizer.ggml.scores arr[f32,32064]   = [-1000.000000, -1000.000000, -1000.00...
llama_model_loader: - kv  27:                  tokenizer.ggml.token_type arr[i32,32064]   = [3, 3, 4, 6, 6, 6, 6, 6, 6, 6, 6, 6, ...
llama_model_loader: - kv  28:                tokenizer.ggml.bos_token_id u32              = 1
llama_model_loader: - kv  29:                tokenizer.ggml.eos_token_id u32              = 32000
llama_model_loader: - kv  30:            tokenizer.ggml.unknown_token_id u32              = 0
llama_model_loader: - kv  31:            tokenizer.ggml.padding_token_id u32              = 32000
llama_model_loader: - kv  32:               tokenizer.ggml.add_bos_token bool             = false
llama_model_loader: - kv  33:               tokenizer.ggml.add_eos_token bool             = false
llama_model_loader: - kv  34:                    tokenizer.chat_template str              = {% for message in messages %}{% if me...
llama_model_loader: - kv  35:               general.quantization_version u32              = 2
llama_model_loader: - type  f32:   67 tensors
llama_model_loader: - type q4_0:  129 tensors
llama_model_loader: - type q6_K:    1 tensors
print_info: file format = GGUF V3 (latest)
print_info: file type   = Q4_0
print_info: file size   = 2.03 GiB (4.55 BPW) 
load_hparams: Phi SWA is currently disabled - results might be suboptimal for some models (see https://github.com/ggml-org/llama.cpp/pull/13676)
load: printing all EOG tokens:
load:   - 32000 ('<|endoftext|>')
load:   - 32007 ('<|end|>')
load: special tokens cache size = 14
load: token to piece cache size = 0.1685 MB
print_info: arch             = phi3
print_info: vocab_only       = 0
print_info: no_alloc         = 0
print_info: n_ctx_train      = 131072
print_info: n_embd           = 3072
print_info: n_embd_inp       = 3072
print_info: n_layer          = 32
print_info: n_head           = 32
print_info: n_head_kv        = 32
print_info: n_rot            = 96
print_info: n_swa            = 0
print_info: is_swa_any       = 0
print_info: n_embd_head_k    = 96
print_info: n_embd_head_v    = 96
print_info: n_gqa            = 1
print_info: n_embd_k_gqa     = 3072
print_info: n_embd_v_gqa     = 3072
print_info: f_norm_eps       = 0.0e+00
print_info: f_norm_rms_eps   = 1.0e-05
print_info: f_clamp_kqv      = 0.0e+00
print_info: f_max_alibi_bias = 0.0e+00
print_info: f_logit_scale    = 0.0e+00
print_info: f_attn_scale     = 0.0e+00
print_info: n_ff             = 8192
print_info: n_expert         = 0
print_info: n_expert_used    = 0
print_info: n_expert_groups  = 0
print_info: n_group_used     = 0
print_info: causal attn      = 1
print_info: pooling type     = 0
print_info: rope type        = 2
print_info: rope scaling     = linear
print_info: freq_base_train  = 10000.0
print_info: freq_scale_train = 1
print_info: n_ctx_orig_yarn  = 4096
print_info: rope_yarn_log_mul= 0.0000
print_info: rope_finetuned   = unknown
print_info: model type       = 3B
print_info: model params     = 3.82 B
print_info: general.name     = Phi 3 Mini 128k Instruct
print_info: vocab type       = SPM
print_info: n_vocab          = 32064
print_info: n_merges         = 0
print_info: BOS token        = 1 '<s>'
print_info: EOS token        = 32000 '<|endoftext|>'
print_info: EOT token        = 32007 '<|end|>'
print_info: UNK token        = 0 '<unk>'
print_info: PAD token        = 32000 '<|endoftext|>'
print_info: LF token         = 13 '<0x0A>'
print_info: EOG token        = 32000 '<|endoftext|>'
print_info: EOG token        = 32007 '<|end|>'
print_info: max token length = 48
load_tensors: loading model tensors, this can take a while... (mmap = true)
load_tensors: offloading 32 repeating layers to GPU
load_tensors: offloading output layer to GPU
load_tensors: offloaded 33/33 layers to GPU
load_tensors:   CPU_Mapped model buffer size =    52.84 MiB
load_tensors: Metal_Mapped model buffer size =  2021.82 MiB
llama_context: constructing llama_context
llama_context: n_seq_max     = 1
llama_context: n_ctx         = 32768
llama_context: n_ctx_seq     = 32768
llama_context: n_batch       = 512
llama_context: n_ubatch      = 512
llama_context: causal_attn   = 1
llama_context: flash_attn    = auto
llama_context: kv_unified    = false
llama_context: freq_base     = 10000.0
llama_context: freq_scale    = 1
llama_context: n_ctx_seq (32768) < n_ctx_train (131072) -- the full capacity of the model will not be utilized
ggml_metal_init: allocating
ggml_metal_init: picking default device: Apple M4
ggml_metal_init: use fusion         = true
ggml_metal_init: use concurrency    = true
ggml_metal_init: use graph optimize = true
llama_context:        CPU  output buffer size =     0.13 MiB
llama_kv_cache:      Metal KV buffer size = 12288.00 MiB
llama_kv_cache: size = 12288.00 MiB ( 32768 cells,  32 layers,  1/1 seqs), K (f16): 6144.00 MiB, V (f16): 6144.00 MiB
llama_context: Flash Attention was auto, set to enabled
llama_context:      Metal compute buffer size =   108.01 MiB
llama_context:        CPU compute buffer size =    70.01 MiB
llama_context: graph nodes  = 935
llama_context: graph splits = 2
time=2026-02-25T18:14:55.163+08:00 level=INFO source=server.go:1388 msg="llama runner started in 2.63 seconds"
time=2026-02-25T18:14:55.163+08:00 level=INFO source=sched.go:566 msg="loaded runners" count=1
time=2026-02-25T18:14:55.163+08:00 level=INFO source=server.go:1350 msg="waiting for llama runner to start responding"
time=2026-02-25T18:14:55.164+08:00 level=INFO source=server.go:1388 msg="llama runner started in 2.64 seconds"
[GIN] 2026/02/25 - 18:15:03 | 200 | 10.997243958s |    192.168.3.22 | POST     "/api/generate"
[GIN] 2026/02/25 - 18:15:03 | 200 |     484.333µs |    192.168.3.22 | GET      "/api/tags"
[GIN] 2026/02/25 - 18:15:03 | 200 |     642.375µs |    192.168.3.22 | GET      "/api/tags"
[GIN] 2026/02/25 - 18:15:03 | 200 |      63.417µs |    192.168.3.22 | GET      "/api/version"
