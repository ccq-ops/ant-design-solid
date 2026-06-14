# AGENTS.md

## Styling Preference

- 在文档站点代码和文档示例中，布局、间距、排版、颜色、响应式行为和简单交互状态优先使用 Tailwind CSS 工具类。
- 当示例重点是组件 API，或需要准确体现 Ant Design Solid 行为时，使用现有组件 API 和设计 token。
- 仅在 Tailwind 工具类会降低代码可读性、需要编写伪元素或 keyframes、集成第三方 CSS，或共享的 docs 级样式表是更清晰的本地模式时，才新增或保留普通 CSS。
- 当 Tailwind class 已足够表达一次性的文档或示例样式时，不要新增 CSS 文件。
