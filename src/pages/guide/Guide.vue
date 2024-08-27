<template>
  <Header />
  <div class="guide">
    <div class="day-guide">
      <h3 class="title">单日计划</h3>
      <v-md-editor v-model="dayText" left-toolbar="undo redo | save todoList todoTemplate" :toolbar="dayTextToolbar" @save="saveDayTextHandle" height="500px" />
    </div>
    <div class="stage-guide">
      <h3 class="title">
        阶段计划(<a href="https://snowdreams1006.github.io/write/mermaid-flow-chart.html" target="_blank">mermaid流程图教程</a>)
      </h3>
      <v-md-editor v-model="flowDiagram" left-toolbar="undo redo | save mermaid mermaidTemplate" :toolbar="flowDiagramToolbar" @save="saveFlowDiagramHandle" height="500px" />
    </div>
    <div class="week-guide">
      <h3 class="title">周计划</h3>
       <ul @click="weekGuideCilckHandle">
          <li v-for="(day, index) in weekDays" :key="day" :class="selectedIndex == index ? 'selected' : ''">{{ day }}</li>
       </ul>
       <v-md-editor v-model="weekGuide[selectedIndex]" left-toolbar="undo redo | save todoList todoTemplate" :toolbar="dayTextToolbar" @save="saveWeekGuideHandle" height="500px" />
    </div>
    <div class="template">
      <h3 class="title">模板修改</h3>
      <ul @click="templateCilckHandle">
         <li v-for="(item, index) in ['工作日模板', '休息日模板', '流程图模板']" :key="item" :class="selectedTemplateIndex == index ? 'selected' : ''">{{ item }}</li>
      </ul>
      <v-md-editor v-model="template" left-toolbar="undo redo | save" @save="saveTemplateHandle" height="500px" />
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import { ref, onMounted, onUpdated, reactive } from 'vue';
import { addMarkdown, getMarkdown, updateMarkdown } from '@/db/markdowns.js';

const dayText = ref('');
const workingDayTemplate = ref(`
### 2024-8-15 星期四
早上
- [ ] 7:00~8:00看书
- [ ] 8:00~8:30吃早餐
- [ ] 9:00~10:00编程(做项目）
- [ ] 10:00~11:00做饭
- [ ] 11:00~13：00吃午餐/娱乐/看书

下午
- [ ] 13:00~14:00午睡
- [ ] 14:00~17:00编程
- [ ] 17:00~17:10锻炼
- [ ] 17:10~19:00洗澡，做饭，娱乐，看书

晚上
- [ ] 19:00~21:30编程
- [ ] 21:30~22:00总结，第二天计划
`);
const restingDayTemplate = ref(`
### 2024-8-18 星期日
早上
- [ ] 7:00~8:00看书
- [ ] 8:00~8:30吃早餐
- [ ] 9:00~10:00编程(做项目）
- [ ] 10:00~11:00做饭
- [ ] 11:00~13：00吃午餐/娱乐/看书

下午
- [ ] 13:00~14:00午睡
- [ ] 14:00~17:00编程
- [ ] 17:00~17:10锻炼
- [ ] 17:10~19:00洗澡，做饭，娱乐，看书

晚上
- [ ] 19:00~21:30编程
- [ ] 21:30~22:00总结，第二天计划
`);
const dayTextToolbar = ref({
  todoList: {
    title: '输入字母"x"表示完成',
    icon: 'v-md-icon-checkbox',
    action(editor) {
      editor.insert(function(selected) {
        // 获取编辑器的所有内容，并按行拆分
        const lines = editor.text.split('\n');
        // 获取最后一行的内容
        const lastLine = lines[lines.length - 1].trim();

        let prefix = '';
        if (lastLine) {
          prefix = '\n- [ ] ';
        } else {
          prefix = '- [ ] ';
        }
        
        const placeholder = '请输入文本';
        const content = selected || placeholder;

        return {
          text: `${prefix}${content}`,
          selected: content,
        };
      });
    },
  },
  todoTemplate: {
    title: 'todoList模板',
    icon: 'v-md-icon-tip',
    menus: [
      {
        name: 'Working Day Template',
        text: '工作日模板',
        action(editor) {
          editor.insert(function() {
            // 获取编辑器的所有内容，并按行拆分
            const lines = editor.text.split('\n');
            // 获取最后一行的内容
            const lastLine = lines[lines.length - 1].trim();

            let content = '';
            if (lastLine) {
              content = '\n' + workingDayTemplate.value;
            } else {
              content = workingDayTemplate.value;
            }

            return {
              text: `${content}`,
              selected: content,
            };
          });
        }
      },
      {
        name: 'Resting Day Template',
        text: '休息日模板',
        action(editor) {
          editor.insert(function() {
            // 获取编辑器的所有内容，并按行拆分
            const lines = editor.text.split('\n');
            // 获取最后一行的内容
            const lastLine = lines[lines.length - 1].trim();

            let content = '';
            if (lastLine) {
              content = '\n' + restingDayTemplate.value;
            } else {
              content = restingDayTemplate.value;
            }

            return {
              text: `${content}`,
              selected: content,
            };
          });
        }
      }
    ]
  }
});

const template = ref('');
let textContent = '工作日模板';
onMounted(async () => {
  const saveWorkingDayTemplate = await getMarkdown('workingDayTemplate');
  if (saveWorkingDayTemplate) {
    workingDayTemplate.value = saveWorkingDayTemplate.markdown;
  }
  template.value = workingDayTemplate.value;

  const saveRestingDayTemplate = await getMarkdown('restingDayTemplate');
  if (saveRestingDayTemplate) {
    restingDayTemplate.value = saveRestingDayTemplate.markdown;
  }

  const saveMermaidTemplate = await getMarkdown('mermaidTemplate');
  if (saveMermaidTemplate) {
    mermaidTemplate.value = saveMermaidTemplate.markdown;
  }
});
onUpdated(async () => {
  const saveWorkingDayTemplate = await getMarkdown('workingDayTemplate');
  if (saveWorkingDayTemplate) {
    workingDayTemplate.value = saveWorkingDayTemplate.markdown;
  }

  const saveRestingDayTemplate = await getMarkdown('restingDayTemplate');
  if (saveRestingDayTemplate) {
    restingDayTemplate.value = saveRestingDayTemplate.markdown;
  }

  const saveMermaidTemplate = await getMarkdown('mermaidTemplate');
  if (saveMermaidTemplate) {
    mermaidTemplate.value = saveMermaidTemplate.markdown;
  }
});

const saveDayTextHandle = async (text) => {
  const dayTextMarkdown = await getMarkdown('dayText');
  if (dayTextMarkdown) { 
    dayTextMarkdown['markdown'] = text;
    updateMarkdown(dayTextMarkdown);
  } else {
    const dayTextMarkdown = {
      key: 'dayText',
      markdown: text
    }
    addMarkdown(dayTextMarkdown);
  }
  alert('保存成功!!!');
}
onMounted(async () => {
  const savedText = await getMarkdown('dayText');
  if (savedText) {
    dayText.value = savedText.markdown;
  }
});

const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
const weekGuide = reactive(['### 星期一', '### 星期二', '### 星期三', '### 星期四', '### 星期五', '### 星期六', '### 星期日']);
const selectedIndex = ref(0);
onMounted(async () => {
  const storedWeekGuide = await getMarkdown('weekGuide');
  if (storedWeekGuide) {
    const parsedWeekGuide = JSON.parse(storedWeekGuide.markdown);
    weekGuide.splice(0, weekGuide.length, ...parsedWeekGuide);
  }
});
const weekGuideCilckHandle = (e) => {
  const element = e.target;
  if (element.tagName == 'LI') {
    const index = Array.from(element.parentNode.children).indexOf(element);
    selectedIndex.value = index;
  }
}
const saveWeekGuideHandle = async (text) => {
  weekGuide[selectedIndex.value] = text;

  const storedWeekGuide = await getMarkdown('weekGuide');
  if (storedWeekGuide) {
    storedWeekGuide.markdown = JSON.stringify(weekGuide);
    await updateMarkdown(storedWeekGuide);
  } else {
    const newWeekGuide = {
      key: 'weekGuide',
      markdown: JSON.stringify(weekGuide),
    };
    await addMarkdown(newWeekGuide);
  }
  alert('保存成功')
}

const flowDiagram = ref('');
const mermaidTemplate = ref(`
\`\`\`mermaid
graph LR
标题[时间管理大师]
A1[1.确定技术栈]--- B1{ }
B1 --> C1[vue + pinia + hook]
B1 --> D1[indexed 浏览器本地存储]
B1 --> E1[插件: e-chart, v-md-eaitor]

A2[2.静态页面的搭建 根据需求开发]

A3[3.组件拆分 代码优化]

A4[4. 打包上线]
\`\`\`
`);
onMounted(async () => {
  const savedText = await getMarkdown('flowDiagram');
  if (savedText) {
    flowDiagram.value = savedText.markdown;
  }
});
const flowDiagramToolbar = ref({
  mermaid: {
    title: 'mermaid代码块',
    icon: 'v-md-icon-code',
    action(editor) {
      editor.insert(function(selected) {
        // 获取编辑器的所有内容，并按行拆分
        const lines = editor.text.split('\n');
        // 获取最后一行的内容
        const lastLine = lines[lines.length - 1].trim();

        let prefix = '';
        if (lastLine) {
          prefix = '\n\`\`\`mermaid\ngraph LR\n';
        } else {
          prefix = '\`\`\`mermaid\ngraph LR\n';
        }

        const suffix = '\n\`\`\`';

        const placeholder = '请输入文本';
        const content = selected || placeholder;

        return {
          text: `${prefix}${content}${suffix}`,
          selected: content,
        };
      });
    },
  },
  mermaidTemplate: {
    title: '流程图模板',
    icon: 'v-md-icon-tip',
    menus: [
      {
        name: 'Simple mermaid template',
        text: '流程图模板',
        action(editor) {
          editor.insert(function() {
            // 获取编辑器的所有内容，并按行拆分
            const lines = editor.text.split('\n');
            // 获取最后一行的内容
            const lastLine = lines[lines.length - 1].trim();

            let content = '';
            if (lastLine) {
              content = '\n' + mermaidTemplate.value;
            } else {
              content = mermaidTemplate.value;
            }

            return {
              text: `${content}`,
              selected: content,
            };
          });
        }
      }
    ]
  }
});
const saveFlowDiagramHandle = async (text) => {
  const flowDiagram = await getMarkdown('flowDiagram');
  if (flowDiagram) {
    flowDiagram['markdown'] = text;
    updateMarkdown(flowDiagram);
  } else {
    const flowDiagram = {
      key: 'flowDiagram',
      markdown: text
    }
    addMarkdown(flowDiagram);
  }
  alert('保存成功!!!')
}

const selectedTemplateIndex = ref(0);
const templateCilckHandle = (e) => {
  const element = e.target;
  textContent = element.textContent;
  if (element.tagName == 'LI') {
    const index = Array.from(element.parentNode.children).indexOf(element);
    selectedTemplateIndex.value = index;
    if (textContent == '工作日模板') {
      template.value = workingDayTemplate.value;
    } else if (textContent == '休息日模板') {
      template.value = restingDayTemplate.value;
    } else if (textContent == '流程图模板') {
      template.value = mermaidTemplate.value;
    }
  }
}

const saveTemplateHandle = async (text) => {
  let key = '';

  if (textContent == '工作日模板') {
    key = 'workingDayTemplate';
  } else if (textContent == '休息日模板') {
    key = 'restingDayTemplate';
  } else if (textContent == '流程图模板') {
    key = 'mermaidTemplate';
  }

  if (key) {
    const existingTemplate = await getMarkdown(key);
    if (existingTemplate) {
      existingTemplate.markdown = text;
      await updateMarkdown(existingTemplate);
    } else {
      const newTemplate = {
        key: key,
        markdown: text,
      };
      await addMarkdown(newTemplate);
    }

    alert('修改成功!!!');
  }
}
</script>

<style lang="scss" scoped>
.completed {
  text-decoration: line-through;
}

.title {
  margin: 0;
  margin-bottom: 10px;
  text-align: center;
  a {
    color: #1bc9c9;
  }
}

.guide {
  width: 100%;
  padding: 0px 10px;
  display: flex;
  flex-wrap: wrap;

  .day-guide,
  .week-guide {
    width: 48%;
    padding-right: 10px;
  }

  .stage-guide,
  .template {
    width: 50%;
  }
}

.template,
.week-guide {
  margin-top: 10px;
 ul {
    display: flex;
    flex-wrap: wrap;
    li {
      padding: 5px 10px;
      margin: 5px 10px 12px 10px;
      border-radius: 8px;
      background-color: #1bc9c9;
      cursor: pointer;
      &:hover {
        background-color: #34dd74 !important;
      }
    }
  }
}

.selected {
  background-color: #34dd74 !important;
}
</style>