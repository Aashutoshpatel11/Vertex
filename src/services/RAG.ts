import { QdrantVectorStore } from "@langchain/qdrant"
import { Embeddings } from "./RAGIndexing"
import { HumanMessage, AIMessage, SystemMessage, context } from "langchain"
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { Runnable, RunnableLambda, RunnableParallel, RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Document } from "langchain";
import { HuggingFaceInference } from "@langchain/community/llms/hf";

export const RAG = async({vectorStoreName, query, messages}) => {

    try {
        // MOdel
        const model = new ChatGoogleGenerativeAI({
            model:"gemini-2.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.3
        })
        // const model = new HuggingFaceInference({
        //     model:"gpt2",
        //     apiKey: process.env.HUGGINGFACEHUB_API_KEY,
        //     temperature: 0.3
        // })
    
    
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
            // verbose: true,
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

        const systemMsg = new SystemMessage(`You are an expert AI assistant designed to provide comprehensive, accurate, and well-structured answers based strictly on the provided context.

            **CORE INSTRUCTIONS:**

            1.  **Format strictly in Markdown.**
            2.  **Structure:** Use clear hierarchy with \`##\` for main sections and \`###\` for subsections.
            3.  **Readability:**
                * Use **bold** for key terms and concepts.
                * Use bullet points (\`-\`) or numbered lists (\`1.\`) for steps or itemized data.
                * **CRITICAL:** Ensure double line breaks (\`\\n\\n\`) between paragraphs, list items, and headers to ensure proper rendering in the UI.
            4.  **Code Blocks:** If the context contains code, output it inside triple backticks (\`\`\`language ... \`\`\`).
            5.  **Tables:** If comparing data, format it as a Markdown table.

            **CONTENT RULES:**

            * Answer **only** using the provided context. If the answer is not in the context, state: "I cannot answer this based on the provided documents."
            * Do not hallucinate or add outside knowledge unless explicitly asked.
            * Cite sources if metadata is available (e.g., [Source: Document A]).

            **TONE:**
            Professional, concise, and direct. Avoid conversational filler (e.g., "Here is the answer"). Start directly with the content.`)
    
        const prompt = ChatPromptTemplate.fromMessages([
            systemMsg,
            ...messages.map( (m) => [m.role, m.content] ),
            ["human","Use the following context to answer the question: {context}\nQuestion: {question}"]
        ]);

        const ParallelChain = RunnableParallel.from({
            question : RunnableLambda.from ( (x:any) => x.query ),
            context : RunnableSequence.from([RunnableLambda.from ( (x:any) => x.query ), retreiver, RunnableLambda.from(docToString)]),
            messageHistory : RunnableLambda.from ( (x:any) => x.messageHistory )
        })
    
        const mainChain = RunnableSequence.from([ParallelChain, prompt, model, parser])
    
        // const response = await mainChain.stream({query})
        return mainChain
    } catch (error) {
        console.log("ERROR IN PERFORMING RAG :: ", error)
        throw error
    }
}   