# RAG chat

Simple application that takes either text or pdfs, creates vector embeddings from those, saves them and then uses that as context when chatting with OpenAI's model. For embedding creation there's a FastAPI service and for the application there's Next.js.

## Development

Only thing you need is an OpenAI API key. After that just run `docker compose up` and you should be running. No guarantees of course though.
