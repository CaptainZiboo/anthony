FROM ollama/ollama
ARG MODELS="mistral mxbai-embed-large"
ENV OLLAMA_KEEP_ALIVE=24h
RUN ollama serve & server=$! ; sleep 5 ; for m in $MODELS ; do ollama pull $m ; done ; kill $server