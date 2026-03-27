# AI 聊天机器人 / AI Chatbot

基于 React + Vite 构建的 AI 聊天应用，接入 DeepSeek API，支持普通对话和联网搜索 Agent 两种模式。

An AI chat application built with React + Vite, powered by DeepSeek API, supporting both regular conversation and web-search Agent modes.

## 功能 / Features

- **DeepSeek 对话模式 / Chat Mode** — 流式输出的 AI 对话，实时显示回复内容 / Streaming AI conversation with real-time response display
- **DeepSeek Agent 模式 / Agent Mode** — AI 自主判断是否需要联网搜索（通过 Tavily API），搜索后综合结果回答 / AI autonomously decides whether to search the web (via Tavily API) and synthesizes results into answers
- 亮色/暗色主题自适应 / Light/dark theme auto-adaptation
- Enter 发送、Shift+Enter 换行 / Enter to send, Shift+Enter for new line

## 技术栈 / Tech Stack

- React 19 + Vite 8
- DeepSeek API (OpenAI compatible format, supports Function Calling)
- Tavily Search API

## 项目结构 / Project Structure

```
src/
├── main.jsx                  # 应用入口 / App entry
├── App.jsx                   # 根组件 / Root component
├── index.css                 # 全局样式 + CSS 变量主题 / Global styles + CSS variable theming
├── api/
│   ├── claude.js             # DeepSeek API 调用（流式对话 + Agent 循环）/ DeepSeek API calls (streaming chat + Agent loop)
│   ├── tools.js              # 工具定义与执行（web_search → Tavily）/ Tool definitions & execution (web_search → Tavily)
│   └── tavily.js             # Tavily 直搜模块（备用，当前未启用）/ Tavily direct search module (backup, currently unused)
├── hooks/
│   └── useChat.js            # 聊天状态管理 Hook / Chat state management Hook
└── components/
    ├── ChatWindow.jsx        # 主界面（模式切换 + 消息列表）/ Main UI (mode switching + message list)
    ├── InputBar.jsx          # 输入框组件 / Input bar component
    └── MessageBubble.jsx     # 消息气泡组件 / Message bubble component
```

## 运行 / Getting Started

### 1. 安装依赖 / Install dependencies

```bash
npm install
```

### 2. 配置环境变量 / Configure environment variables

在项目根目录创建 `.env` 文件 / Create a `.env` file in the project root:

```env
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_TAVILY_API_KEY=your_tavily_api_key
```

- DeepSeek API Key: https://platform.deepseek.com
- Tavily API Key: https://tavily.com

### 3. 启动开发服务器 / Start dev server

```bash
npm run dev
```

### 4. 构建生产版本 / Build for production

```bash
npm run build
npm run preview
```
