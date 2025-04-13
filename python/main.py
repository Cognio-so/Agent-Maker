from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import os
from KB_indexer import KB_indexer
from dotenv import load_dotenv
import shutil
import tempfile
import uuid
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from fastapi import WebSocket

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"], # Add all frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory - add this after app = FastAPI()
os.makedirs(os.path.join(os.getcwd(), "public", "uploads"), exist_ok=True)
app.mount("/public", StaticFiles(directory="public"), name="public")

# Store models in a global dictionary for reuse
# Add this after the app definition (around line 25)
gpt_model_cache = {}  # Maps collection_name to model

# Store API keys for different models
MODEL_API_KEYS = {
    "gpt-4": os.environ.get("OPENAI_API_KEY"),
    "gpt-4o-mini": os.environ.get("OPENAI_API_KEY"),
    "gpt-3.5": os.environ.get("OPENAI_API_KEY"),
    "claude": os.environ.get("ANTHROPIC_API_KEY"),
    "gemini": os.environ.get("GOOGLE_API_KEY"),
    "llama": os.environ.get("META_API_KEY")
}

# Add a model translation dictionary near the top of main.py
MODEL_TRANSLATIONS = {
    "gpt-4": "gpt-4o",          # Latest GPT-4 model
    "gpt-4o-mini": "gpt-4o-mini", # Latest GPT-4 model
    "gpt-3.5": "gpt-3.5-turbo", # Correct model name for API
    "claude": "claude-3-opus-20240229",  # Latest Claude model
    "gemini": "gemini-pro",     # Google's Gemini model
    "llama": "llama-3-70b-chat" # Meta's Llama model
}

class IndexRequest(BaseModel):
    file_urls: List[str]
    user_email: str
    gpt_name: str
    gpt_id: str
    force_recreate: bool = False

class GPTOpenRequest(BaseModel):
    """Model for handling when a custom GPT opens"""
    user_email: str
    gpt_name: str
    gpt_id: str
    file_urls: List[str]
    schema: Optional[Dict] = None  # The GPT's schema/configuration

# Add new chat model
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    collection_name: str
    history: Optional[List[Message]] = []
    memory: Optional[List[Dict[str, Any]]] = []  # Add memory field
    user_documents: Optional[List[str]] = []

@app.get("/")
async def root():
    """Root endpoint for health checks"""
    return {
        "status": "online",
        "message": "AI Agent backend is running",
        "version": "1.0.0"
    }

@app.post("/gpt-opened")
async def gpt_opened(request: GPTOpenRequest):
    """
    Endpoint triggered when a custom GPT opens.
    Automatically indexes the knowledge specified in the GPT's schema.
    """
    try:
        # Sanitize inputs for collection name
        sanitized_email = ''.join(c if c.isalnum() else '_' for c in request.user_email)
        sanitized_gpt_name = ''.join(c if c.isalnum() else '_' for c in request.gpt_name)
        
        # Ensure collection name starts with a letter
        collection_prefix = "kb" if not sanitized_email or not sanitized_email[0].isalpha() else ""
        collection_name = f"{collection_prefix}_{sanitized_email}_{sanitized_gpt_name}_{request.gpt_id}"
        collection_name = collection_name[:63]  # Limit length
        
        # Extract and store model from schema with better logging
        frontend_model = "gpt-4o-mini"  # Default model
        if request.schema and 'model' in request.schema:
            frontend_model = request.schema['model']
            gpt_model_cache[collection_name] = frontend_model
            
            # Translate to actual API model name
            model = MODEL_TRANSLATIONS.get(frontend_model, frontend_model)
            
            print(f"✅ CustomGPT using model: {frontend_model} (API: {model}) for collection: {collection_name}")
            
            # Check if we have the API key for this model
            if model in MODEL_API_KEYS and MODEL_API_KEYS[model]:
                print(f"✅ Found API key for model: {model}")
            else:
                print(f"⚠️ Warning: No API key found for model: {model}. Using default OpenAI key.")
        else:
            print(f"⚠️ No model specified in schema, using default: {model}")
            gpt_model_cache[collection_name] = model
        
        # Get configuration from environment
        qdrant_url = os.environ.get("QDRANT_URL")
        qdrant_api_key = os.environ.get("QDRANT_API_KEY")
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        
        # We don't force recreate by default when a GPT opens to avoid losing indexed data
        force_recreate = False
        
        # Run indexer with files from GPT schema
        success = KB_indexer(
            file_urls=request.file_urls,
            qdrant_url=qdrant_url,
            qdrant_api_key=qdrant_api_key,
            collection_name=collection_name,
            openai_api_key=openai_api_key,
            force_recreate_collection=force_recreate,
            max_workers=5
        )
        
        if success:
            return {
                "success": True, 
                "collection_name": collection_name,
                "message": "GPT knowledge base indexed successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="KB indexing failed when GPT opened")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during GPT initialization: {str(e)}")

@app.post("/index-knowledge")
async def index_knowledge(request: IndexRequest):
    # Sanitize inputs for collection name
    sanitized_email = ''.join(c if c.isalnum() else '_' for c in request.user_email)
    sanitized_gpt_name = ''.join(c if c.isalnum() else '_' for c in request.gpt_name)
    
    # Ensure collection name starts with a letter
    collection_prefix = "kb" if not sanitized_email or not sanitized_email[0].isalpha() else ""
    collection_name = f"{collection_prefix}_{sanitized_email}_{sanitized_gpt_name}_{request.gpt_id}"
    collection_name = collection_name[:63]  # Limit length
    
    # Get configuration from environment
    qdrant_url = os.environ.get("QDRANT_URL")
    qdrant_api_key = os.environ.get("QDRANT_API_KEY")
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    
    # Run indexer
    success = KB_indexer(
        file_urls=request.file_urls,
        qdrant_url=qdrant_url,
        qdrant_api_key=qdrant_api_key,
        collection_name=collection_name,
        openai_api_key=openai_api_key,
        force_recreate_collection=request.force_recreate,
        max_workers=5
    )
    
    if success:
        return {"success": True, "collection_name": collection_name}
    else:
        raise HTTPException(status_code=500, detail="KB indexing failed")

@app.post("/chat")
async def chat(request: ChatRequest):
    """Handle chat requests with RAG support using both knowledge base and user documents"""
    try:
        # Extract params from request
        message = request.message
        collection_name = request.collection_name
        user_documents = request.user_documents or []
        history = request.history or []
        memory = request.memory or []  # Add memory extraction
        
        # Define user documents collection if present
        user_collection_name = f"{collection_name}_user_docs" if user_documents else None
        
        # Get the model from cache or use a default
        frontend_model = gpt_model_cache.get(collection_name, "gpt-4o-mini")
        
        # Translate frontend model name to actual API model name
        model = MODEL_TRANSLATIONS.get(frontend_model, frontend_model)
        
        print(f"🤖 Using model {frontend_model} (API: {model}) for chat with collection {collection_name}")
        
        # Get configuration from environment
        qdrant_url = os.environ.get("QDRANT_URL")
        qdrant_api_key = os.environ.get("QDRANT_API_KEY")
        
        # Get the appropriate API key based on model
        if frontend_model.startswith("gpt-"):
            openai_api_key = MODEL_API_KEYS.get("gpt-4", os.environ.get("OPENAI_API_KEY"))
        elif frontend_model == "claude":
            openai_api_key = MODEL_API_KEYS.get("claude", os.environ.get("ANTHROPIC_API_KEY"))
        elif frontend_model == "gemini":
            openai_api_key = MODEL_API_KEYS.get("gemini", os.environ.get("GOOGLE_API_KEY"))
        elif frontend_model == "llama":
            openai_api_key = MODEL_API_KEYS.get("llama", os.environ.get("META_API_KEY"))
        else:
            openai_api_key = os.environ.get("OPENAI_API_KEY")
            
        # Check if we have the API key
        if not openai_api_key:
            print(f"⚠️ No API key found for model: {frontend_model}")
            return {"success": False, "response": f"No API key configured for model: {frontend_model}"}
        
        # Format history for KB_indexer
        formatted_history = [
            {"role": msg.role, "content": msg.content} for msg in history
        ]
        
        # Format memory for KB_indexer
        formatted_memory = memory
        
        # Use the KB_indexer module to perform the RAG query
        from KB_indexer import perform_rag_query
        
        # Get the model from cache or use a default
        model = gpt_model_cache.get(collection_name, "gpt-4o-mini")
        print(f"Using model {model} for chat with collection {collection_name}")
        
        response = perform_rag_query(
            query=message,
            base_collection_name=collection_name,
            user_collection_name=user_collection_name,
            qdrant_url=qdrant_url,
            qdrant_api_key=qdrant_api_key,
            openai_api_key=openai_api_key,
            history=formatted_history,
            memory=formatted_memory,  # Pass memory to RAG
            model=model  # Use the stored model
        )
        
        return {"success": True, "response": response}
    
    except Exception as e:
        import traceback
        print(f"Error processing chat: {e}")
        print(traceback.format_exc())
        return {"success": False, "response": f"Error: {str(e)}"}

@app.get("/gpt-collection-info/{user_email}/{gpt_id}")
async def get_gpt_collection_info(user_email: str, gpt_id: str, gpt_name: str = ""):
    """
    Get the collection name for a specific GPT.
    Can be used by frontend to determine if a GPT's knowledge base is already indexed.
    """
    try:
        sanitized_email = ''.join(c if c.isalnum() else '_' for c in user_email)
        sanitized_gpt_name = ''.join(c if c.isalnum() else '_' for c in gpt_name)
        
        collection_prefix = "kb" if not sanitized_email or not sanitized_email[0].isalpha() else ""
        collection_name = f"{collection_prefix}_{sanitized_email}_{sanitized_gpt_name}_{gpt_id}"
        collection_name = collection_name[:63]
        
        # Here you could check if the collection actually exists in Qdrant
        # For simplicity, we're just returning the constructed name
        
        return {
            "collection_name": collection_name,
            "exists": True  # In production, you'd verify this with Qdrant
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving GPT collection info: {str(e)}")

@app.post("/chat-stream")
async def chat_stream(request: ChatRequest):
    """Handle streaming chat requests with RAG support"""
    try:
        # Extract params from request
        message = request.message
        collection_name = request.collection_name
        user_documents = request.user_documents or []
        history = request.history or []
        memory = request.memory or []
        
        # Define user documents collection if present
        user_collection_name = f"{collection_name}_user_docs" if user_documents else None
        
        # Get the model from cache or use a default
        frontend_model = gpt_model_cache.get(collection_name, "gpt-4o-mini")
        
        # Translate frontend model name to actual API model name
        model = MODEL_TRANSLATIONS.get(frontend_model, frontend_model)
        
        print(f"Using model {frontend_model} (API: {model}) for streaming chat with collection {collection_name}")
        
        # Get configuration from environment
        qdrant_url = os.environ.get("QDRANT_URL")
        if not qdrant_url:
            print(f"No QDRANT_URL found in environment")
            async def error_response():
                yield f'data: {{"error": "No QDRANT_URL configured"}}\n\n'
                yield f'data: {{"done": true}}\n\n'
            return StreamingResponse(error_response(), media_type="text/event-stream")
            
        qdrant_api_key = os.environ.get("QDRANT_API_KEY")
        
        # Get the appropriate API key based on model provider
        openai_api_key = os.environ.get("OPENAI_API_KEY")  # Always needed for embeddings
        
        # Get model-specific API key
        if model.startswith("gpt-"):
            model_api_key = MODEL_API_KEYS.get("gpt-4", os.environ.get("OPENAI_API_KEY"))
        elif model == "claude":
            model_api_key = MODEL_API_KEYS.get("claude", os.environ.get("ANTHROPIC_API_KEY"))
        elif model == "gemini":
            model_api_key = MODEL_API_KEYS.get("gemini", os.environ.get("GOOGLE_API_KEY"))
        elif model == "llama":
            model_api_key = MODEL_API_KEYS.get("llama", os.environ.get("META_API_KEY"))
        else:
            model_api_key = os.environ.get("OPENAI_API_KEY")
        
        # Check if we have the OpenAI API key for embeddings
        if not openai_api_key:
            print(f"No OpenAI API key found for embeddings")
            async def error_response():
                yield f'data: {{"error": "No OpenAI API key configured for embeddings"}}\n\n'
                yield f'data: {{"done": true}}\n\n'
            return StreamingResponse(error_response(), media_type="text/event-stream")
        
        # Check if we have the model-specific API key
        if not model_api_key:
            print(f"No API key found for model: {model}")
            async def error_response():
                yield f'data: {{"error": "No API key configured for model: {model}"}}\n\n'
                yield f'data: {{"done": true}}\n\n'
            return StreamingResponse(error_response(), media_type="text/event-stream")
        
        # Format history
        formatted_history = [
            {"role": msg.role, "content": msg.content} for msg in history
        ]
        
        # Format memory
        formatted_memory = memory
        
        # Use streaming implementation
        from KB_indexer import perform_rag_query_stream
        
        # Add better debugging to help diagnose the issue
        print(f"Stream request with: model={model}, collection={collection_name}")
        
        return await perform_rag_query_stream(
            query=message,
            base_collection_name=collection_name,
            user_collection_name=user_collection_name,
            qdrant_url=qdrant_url,
            qdrant_api_key=qdrant_api_key,
            openai_api_key=openai_api_key,  # For embeddings
            model_api_key=model_api_key,    # For completions with specific model
            history=formatted_history,
            memory=formatted_memory,        # Pass memory to streaming RAG
            model=model,  # Use the selected model
            top_k=3  # Retrieve enough docs for quality responses
        )
    
    except Exception as e:
        import traceback
        print(f"Error processing streaming chat: {e}")
        print(traceback.format_exc())
        
        async def error_response():
            import traceback
            trace = traceback.format_exc()
            print(f"Detailed error traceback: {trace}")
            yield f'data: {{"content": "Error processing your request: {str(e)}"}}\n\n'
            yield f'data: {{"error": "Error in streaming: {str(e)}"}}\n\n'
            yield f'data: {{"done": true}}\n\n'
        
        return StreamingResponse(error_response(), media_type="text/event-stream")

@app.post("/upload-chat-files")
async def upload_chat_files(
    files: List[UploadFile] = File(...),
    user_email: str = Form(...),
    gpt_id: str = Form(...),
    gpt_name: str = Form(...),
    collection_name: str = Form(...),
    is_user_document: str = Form(default="false")
):
    try:
        # Process files in parallel using ThreadPoolExecutor
        import concurrent.futures
        
        # Create temp directory to store uploaded files
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save files to temp directory
            file_paths = []
            
            # First, get all files saved to temp directory
            for file in files:
                temp_file_path = os.path.join(temp_dir, file.filename)
                with open(temp_file_path, "wb") as buffer:
                    # Read in chunks to reduce memory usage
                    chunk_size = 1024 * 1024  # 1MB chunks
                    while chunk := await file.read(chunk_size):
                        buffer.write(chunk)
                
                file_paths.append((temp_file_path, file.filename))
            
            # Then process them in parallel
            upload_dir = os.path.join(os.getcwd(), "public", "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            
            processed_paths = []
            
            # Function to process a single file
            def process_file(file_info):
                temp_path, filename = file_info
                unique_filename = f"{uuid.uuid4()}-{filename}"
                dest_path = os.path.join(upload_dir, unique_filename)
                
                # Copy the file
                shutil.copy(temp_path, dest_path)
                return dest_path
            
            # Process all files in parallel
            with concurrent.futures.ThreadPoolExecutor(max_workers=min(10, len(file_paths))) as executor:
                processed_paths = list(executor.map(process_file, file_paths))
        
        # If no files were processed, return error
        if not processed_paths:
            return {"success": False, "message": "No valid files uploaded"}
        
        # For user documents, use special collection
        if is_user_document.lower() == "true":
            user_collection_name = f"{collection_name}_user_docs"
        else:
            user_collection_name = collection_name
        
        # Get configuration from environment
        qdrant_url = os.environ.get("QDRANT_URL")
        qdrant_api_key = os.environ.get("QDRANT_API_KEY")
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        
        # Index files using direct file paths with increased max_workers
        success = KB_indexer(
            file_urls=processed_paths,
            qdrant_url=qdrant_url,
            qdrant_api_key=qdrant_api_key,
            collection_name=user_collection_name,
            openai_api_key=openai_api_key,
            force_recreate_collection=is_user_document.lower() == "true",
            max_workers=min(15, len(processed_paths) * 2)  # Scale based on file count
        )
        
        if success:
            # Generate URLs for the frontend
            urls = [f"http://localhost:8000/public/uploads/{os.path.basename(path)}" for path in processed_paths]
            return {
                "success": True, 
                "message": "Files processed successfully",
                "collection_name": user_collection_name,
                "file_urls": urls
            }
        else:
            return {"success": False, "message": "Failed to index files"}
            
    except Exception as e:
        import traceback
        print(f"Error processing chat files: {e}")
        print(traceback.format_exc())
        return {"success": False, "message": f"Error processing files: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
