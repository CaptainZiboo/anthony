# Anthony City Chatbot

This project is a chatbot designed to assist the residents of the city of Anthony by providing accurate and helpful information based on the data available in the Redis vector store. The chatbot uses LangChain and ChatOllama for natural language processing and retrieval.

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/CaptainZiboo/anthony
   cd anthony
   ```

2. Ensure you have the necessary Docker images and volumes:

   ```sh
   docker-compose pull
   ```

3. Build the custom Docker image for the `ollama` service:

   ```sh
   docker-compose build
   ```

4. Start the services:

   ```sh
   docker-compose up -d
   ```

   This will start the following services:

   - `ollama`: The main service for the chatbot, which will pull the necessary models (`mistral` and `mxbai-embed-large`).
   - `redis-stack`: The Redis stack for storing vector data.
   - `redis-insight`: A web interface for managing Redis.

   If the models aren't working, try downloading those directly from the container :

   ```
   docker compose exec ollama ollama pull mistral
   docker compose exec ollama ollama pull mxbai-embed-large
   ```

5. Access the services:
   - Chatbot Web UI: [http://localhost:3000](http://localhost:3000)
   - Redis Insight: [http://localhost:5540](http://localhost:5540)

## Usage

The chatbot is designed to provide accurate and helpful information based on the data available in the Redis vector store. It can answer questions, provide summaries, and more.

### Example Commands

- To ask a question: Simply type your question in the chatbot interface.
- To get a summary: Type a request for a summary in the chatbot interface.

## Development

To develop and test the chatbot locally, you can use the following commands:

- To stop the services:

  ```sh
  docker-compose down
  ```

- To view logs:

  ```sh
  docker-compose logs -f
  ```
