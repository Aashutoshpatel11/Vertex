import { QdrantVectorStore } from "@langchain/qdrant"
import { Embeddings } from "./RAGIndexing"
import { HumanMessage, AIMessage, SystemMessage, context } from "langchain"
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { Runnable, RunnableLambda, RunnableParallel, RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Document } from "langchain";


export const RAG = async({vectorStoreName, query, messages}) => {

    try {
        // MOdel
        const model = new ChatGoogleGenerativeAI({
            model:"gemini-2.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.3
        })
    
    
        // VectorStore
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            Embeddings, {
                url: process.env.QDRANT_URL,
                collectionName: vectorStoreName,
            }
        )
    
    
        // Retreival
        const retreiver = vectorStore.asRetriever({
            k: 4,
            verbose: true,
            searchType: 'similarity',
        })

        const docToString = (documents) => {
            let result = ""
            documents.map( (doc) => {
                result = result + doc.pageContent
            } )
            return result
        }
    
    
        // Prompt 
        const parser = new StringOutputParser();
    
        const prompt = ChatPromptTemplate.fromMessages([
            ["system","You are a helpful assistant that helps users find information."],
            ...messages.map( (m) => [m.role, m.content] ),
            ["human","Use the following context to answer the question: {context}\nQuestion: {question}"]
        ]);

        const ParallelChain = RunnableParallel.from({
            question : RunnableLambda.from ( (x:any) => x.query ),
            context : RunnableSequence.from([RunnableLambda.from ( (x:any) => x.query ), retreiver, RunnableLambda.from(docToString)]),
            messageHistory : RunnableLambda.from ( (x:any) => x.messageHistory )
        })
    
        const mainChain = RunnableSequence.from([ParallelChain, prompt, model, parser])
    
        const response = await mainChain.invoke({query})
        return response
    } catch (error) {
        console.log("ERROR IN PERFORMING RAG :: ", error)
        throw error
    }
}   