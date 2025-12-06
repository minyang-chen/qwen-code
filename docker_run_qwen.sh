\
docker run -it --network host \
  -e OPENAI_API_KEY="YOUR_OPENAI_API_KEY" \
  -e OPENAI_BASE_URL="http://10.0.0.139:30000/v1" \
  -e OPENAI_MODEL="gpt-3.5-turbo" \
  qwen-code


#bash
## 1. Verify environment variables are set
#docker run -it \
#  -e OPENAI_API_KEY="your_actual_key" \
#  -e OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1" \
#  -e OPENAI_MODEL="qwen3-coder-plus" \
#  qwen-code

# 2. If using host network (for connectivity issues)
#docker run -it --network host \
#  -e OPENAI_API_KEY="your_key" \
#  -e OPENAI_BASE_URL="your_endpoint" \
#  -e OPENAI_MODEL="your_model" \
#  qwen-code

# 3. Test connectivity inside container
#docker run -it qwen-code bash
# Then run: curl -I https://dashscope.aliyuncs.com
