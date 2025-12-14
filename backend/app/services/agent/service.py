import os
from typing import List, Dict, Any

# LangChain Importları
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

# DÜZELTME BURADA: langchain yerine langchain_classic kullanıyoruz
try:
    from langchain.agents import AgentExecutor, create_tool_calling_agent
except ImportError:
    from langchain_classic.agents import AgentExecutor, create_tool_calling_agent

# Bizim Modüllerimiz
from app.services.agent.tools import tools_list
from app.services.agent.prompts import get_system_prompt
from app.core.config import settings

class AgentService:
    def __init__(self):
        self.llm = self._initialize_llm()
        self.tools = tools_list
        self.agent_executor = self._create_agent()

    def _initialize_llm(self):
        """
        .env dosyasındaki ayarlara göre LLM'i seçer.
        """
        # 1. Groq Kontrolü
        if settings.GROQ_API_KEY:
            print("AI Agent: Groq (GPT-OSS-120b) Modeli Kullanılıyor.")
            return ChatGroq(
                model="openai/gpt-oss-120b", 
                temperature=0.2,
                max_tokens=None,
                timeout=None,
                max_retries=2,
                api_key=settings.GROQ_API_KEY
            )
        
        # 2. OpenRouter Kontrolü (Önerilen)
        if settings.OPENROUTER_API_KEY:
            print("AI Agent: OpenRouter Modeli Kullanılıyor.")
            return ChatOpenAI(
                model="amazon/nova-2-lite-v1:free", 
                temperature=0.2,
                api_key=settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                default_headers={
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "FilmFlow AI"
                }
            )

        # 3. OpenAI Kontrolü
        elif settings.OPENAI_API_KEY:
            print("AI Agent: Standart OpenAI Modeli Kullanılıyor.")
            return ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.2,
                api_key=settings.OPENAI_API_KEY
            )
        
        else:
            raise ValueError("HATA: API Key bulunamadı! Lütfen .env dosyasına OPENROUTER_API_KEY, GROQ_API_KEY veya OPENAI_API_KEY ekleyin.")

    def _create_agent(self) -> AgentExecutor:
        """Tool Calling Agent oluşturur."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", get_system_prompt()),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])

        agent = create_tool_calling_agent(self.llm, self.tools, prompt)
        
        return AgentExecutor(
            agent=agent, 
            tools=self.tools, 
            verbose=True, 
            handle_parsing_errors=True
        )

    async def chat(self, user_input: str, chat_history: List[Dict[str, str]] = []) -> str:
        """Sohbeti başlatan fonksiyon."""
        langchain_history = []
        for msg in chat_history:
            if msg["role"] == "user":
                langchain_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "ai" or msg["role"] == "assistant":
                langchain_history.append(AIMessage(content=msg["content"]))

        response = await self.agent_executor.ainvoke({
            "input": user_input,
            "chat_history": langchain_history
        })

        return response["output"]

# Global Singleton instance
agent_service = AgentService()