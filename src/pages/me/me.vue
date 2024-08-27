<template>
  <Header />
  <div class="me">
    <div class="contain">
      <h3 class="title">个人</h3>
      <ul class="personage">
        <li>
          <h4 class="title">
            星座  
            <input type="text" v-model="consName" @keyup.enter="changeConstellation">
            <a :href="constellationIntactURL" target="_blank">更详细的数据</a>
          </h4>
          <span class="text">{{ todaySummarize }}</span>
        </li>
        <li>
          <h4 class="title">座右铭
            <input class="add-motto" type="text" v-model="addMotto" @blur="handleAddMotto" @keyup.enter="handleAddMotto">
          </h4>
          <li class="text" v-for="(motto, index) in mottos" :key="motto">
            <button class="setting-as-header-title" @click="handleSettingAsHeaderTitle(motto)">设为头部标题</button>
            <button class="delete" @click="handleDelete(index)">删除</button>
            {{ motto }}
          </li>
        </li>
        <li>
          <h4 class="title">每日鸡汤</h4>
          <span :class="['iconfont', isCollect ? 'icon-shoucang' : 'icon-shoucang8']" @click="isCollectHandle"></span>
          <span>{{ carlet }}</span>
        </li>
      </ul>
    </div>
    <div class="contain">
      <h3 class="title">数据</h3>
      <ul class="data">
        <li @click="dataExportHandle">
          <span class="iconfont icon-xiazai"></span>
          数据导出
        </li>
        <li>
          <span class="iconfont icon-shangchuan" @click="triggerFileUpload"></span>
          <input type="file" ref="uploadFileRef" @change="handleFile" style="display: none;" />
          数据导入
        </li>
        <li>
          <span class="iconfont icon-tongbu1"></span>
          数据同步
        </li>
      </ul>
    </div>

    <div class="contain">
        <h3 class="title">主题</h3>
        <ul class="data">
          <li @click="changeTheme">
            <span class="iconfont icon-taiyang"></span>
          </li>
          <li @click="changeTheme">
            <span class="iconfont icon-moon-fill"></span>
          </li>
        </ul>
      </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import { onMounted, ref, nextTick, computed, toRaw } from 'vue';
import { exportIndexedDB, importIndexedDB } from '@/db/initDB.js';
import { getMeByKey, updateMe } from '@/db/me.js';
import { initStore } from '@/store/index.js';
import { storeToRefs } from 'pinia'
const store = initStore();
const { isDarkTheme } = storeToRefs(store)

// 个人
// 星座
const constellationBaseURL = ref('https://www.xzw.com/fortune/');
const consName = ref("天蝎座");
const type = ref("today");
const todaySummarize = ref("");

const consNameMap = {
  "白羊座": "aries",
  "金牛座": "taurus",
  "双子座": "gemini",
  "巨蟹座": "cancer",
  "狮子座": "leo",
  "处女座": "virgo",
  "天秤座": "libra",
  "天蝎座": "scorpio",
  "射手座": "sagittarius",
  "摩羯座": "capricorn",
  "水瓶座": "aquarius",
  "双鱼座": "pisces",
};
const constellationIntactURL = computed(() => {
  const consEnglishName = consNameMap[consName.value];
  return consEnglishName ? `${constellationBaseURL.value}${consEnglishName}/` : constellationBaseURL.value;
});

// 座右铭
const mottos = ref([]);
const addMotto = ref('');

onMounted(async () => {
  const result = await getMeByKey('mottos');
  if (result) {
    mottos.value = result.value;
  }
})
const handleAddMotto = (event) => {
  if (addMotto.value.trim()) {
    mottos.value.push(addMotto.value.trim());
    const mottosObj = {
      key: 'mottos',
      value: toRaw(mottos.value)
    }
    updateMe(mottosObj);
    addMotto.value = '';
    event.target.blur();
    alert('添加成功!!!');
  }
}
const handleSettingAsHeaderTitle = (motto) => {
  const mottoObj = {
    key: 'motto',
    value: motto
  }
  updateMe(mottoObj);
  alert("设置成功!");
}
const handleDelete = (index) => {
  if (confirm("您确定要删除此句座右铭吗?")) {
    mottos.value.splice(index, 1);
    const mottosObj = {
      key: 'mottos',
      value: toRaw(mottos.value)
    }
    updateMe(mottosObj);
  }
}

async function getConstellation() {
  const apiKey = 'fc3f8344aa73785e5838bcef6f4e364c';
  const url = `http://localhost:5173/constellationApi/constellation/getAll?consName=${encodeURIComponent(consName.value)}&type=${type.value}&key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if (!response.ok) {
      throw new Error('请求失败');
    }
    const result = await response.json();
    todaySummarize.value = result.summary;
    if (todaySummarize.value) {
      sessionStorage.setItem('todaySummarize', todaySummarize.value);
    }
  } catch (error) {
    console.error('请求错误:', error);
  }
}
onMounted(async () => {
  todaySummarize.value = sessionStorage.getItem('todaySummarize');
  if (!todaySummarize.value) { 
    getConstellation();
  }
})
const changeConstellation = () => {
  getConstellation();
}

// 心灵鸡汤
const isCollect = ref(false);
const carlet = ref('');
async function getCarlet () {
  const apiKey = 'b393eb0dc93d9c2b990d8aadd23137f9';
  const url = `http://localhost:5173/carletApi/fapig/soup/query?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if (!response.ok) {
      throw new Error('请求失败');
    }
    const result = await response.json();
    console.log(result);
    if (result.reason == "success") {
      carlet.value = result.result.text;
      if (carlet.value) {
        sessionStorage.setItem('carlet', carlet.value);
      }
    }
  } catch (error) {
    console.error('请求错误:', error);
  }
}
onMounted(() => {
  isCollect.value = sessionStorage.getItem('isCollect');
  carlet.value = sessionStorage.getItem('carlet');
  if (!carlet.value) { 
    getCarlet();
  }
})
const isCollectHandle = () => {
  isCollect.value = !isCollect.value;
  sessionStorage.setItem('isCollect', isCollect.value);
  if (isCollect.value && carlet.value) {
    console.log(mottos.value)
    const result = mottos.value.filter(item => item == carlet.value)[0];
    if (result) {
      alert('该语录已收藏');
      return;
    }
    mottos.value.push(carlet.value);
    const mottosObj = {
      key: 'mottos',
      value: toRaw(mottos.value)
    }
    updateMe(mottosObj);
  }
}

// 数据
// 导出整个indexdb数据库的数据
const dataExportHandle = async () => {
  const userConfirmed = confirm('确定要导出全部数据吗？');

  if (userConfirmed) {
    try {
      const data = await exportIndexedDB();
      const jsonData = JSON.stringify(data);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = '人生时间管理大师.json';
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }
};

// 导入整个indexdb数据库的数据
const uploadFileRef = ref(null);
const triggerFileUpload = () => {
  uploadFileRef.value.click(); // 触发 input 的点击事
}
const handleFile = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async function(e) {
    const data = JSON.parse(e.target.result);
    importIndexedDB(data).then(() => {
      alert("数据导入成功!!!");
    }).catch(error => {
      alert("数据导入失败!");
      console.log("数据导入失败!", error);
    })
  }
  reader.readAsText(file);
}


// 主题
const changeTheme = () => {
  store.ChangeIsDarkTheme();
  document.documentElement.classList.toggle('dark-theme', isDarkTheme.value);
  document.documentElement.classList.toggle('light-theme', !isDarkTheme.value);
}
</script>

<style lang="scss" scoped>
.me {
  padding: 5px 10px;
}

.title {
  margin: 0 0 8px 0;
  text-align: left;
  a {
    margin-left: 10px;
    color: aqua;
  }
  .add-motto {
    width: 200px;
    margin-left: 10px;
    padding: 2px 5px;
    border: 1px solid var(--primary-color);
  }
}

.iconfont {
  cursor: pointer;
}

.personage {
  li {
    padding: 5px;
    margin-bottom: 10px;
    border: 1px dashed var(--primary-color);
    input {
      width: 40px;
      color: var(--text-color);
      outline: none;
      border: none;
      background-color: transparent;
    }
  }
  .text {
    width: 100%;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5; /* 行高，根据需要调整 */
    text-align: left;
    word-wrap: break-word; /* 防止长单词溢出 */
    .setting-as-header-title {
      margin-right: 5px;
      padding: 5px 8px;
      border-radius: 8px;
      outline: none;
      border: none;
      color: var(--text-color);
      background-color: #13a4cd;
      cursor: pointer;
    }
    .delete {
      margin-right: 5px;
      padding: 5px 25px;
      border-radius: 8px;
      outline: none;
      border: none;
      color: var(--text-color);
      background-color: #fc5858;
      cursor: pointer;
    }
  }

  .motto-edit {
    width: 97%;
    padding: 5px;
    font-size: 16px;
    outline: none;
    margin-left: 25px;
  }
}

.contain {
  float: left;
  box-sizing: border-box;
  width: 100%;
  padding: 5px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid var(--primary-color);

  .data {
    display: flex;

    li {
      min-width: 150px;
      height: 150px;
      margin-right: 20px;
      text-align: center;
      overflow: auto;

      .iconfont {
        display: block;
        margin-bottom: 8px;
        line-height: 100px;
        text-align: center;
        font-size: 45px;
        border: 1px dashed var(--primary-color);
        cursor: pointer;
      }
    }
  }
}
</style>