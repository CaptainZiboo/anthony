FROM ollama/ollama
ARG MODELS="llama3.1 mxbai-embed-large"
ENV OLLAMA_KEEP_ALIVE=24h
RUN ollama serve & server=$! ; sleep 5 ; for m in $MODELS ; do ollama pull $m ; done ; kill $server