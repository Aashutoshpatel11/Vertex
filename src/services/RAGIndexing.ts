import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { Document } from "langchain"
import {QdrantClient} from '@qdrant/js-client-rest';
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const client = new QdrantClient({
    url: process.env.QDRANT_CLUATER_ENDPOINT,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false
});

export const Embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey:process.env.GOOGLE_API_KEY,
    model:"gemini-embedding-001"
})

export const RAGIndexing = async(storeName) => {
    // DATA Loading
    try {
        const loader = new PDFLoader(`uploads/${storeName}.pdf`)
        const loaded_raw_data = await loader.load()
        let loaded_data = ""
        loaded_raw_data.map( (document) => {
            loaded_data = loaded_data + document.pageContent
        } )
    
    
        //TEXT Splitting
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 850,
            chunkOverlap: 20,
        })
        const splitted_data = await splitter.splitDocuments(loaded_raw_data)
    

        // STORE DATA in vectore store
        const vectorStore = new QdrantVectorStore( Embeddings, {
            url:process.env.QDRANT_URL,
            collectionName:storeName
        } )
    
        await vectorStore.addDocuments(splitted_data)
    } catch (error) {
        console.log("RAG Indexing :: Error :: ", error.message)
    }
    
}