<template>
  <Header/>
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
          <div class="constellation-loader-container" v-if="isConstellationLoader  === true">
            <div class="constellation-loader"></div>
          </div>
          <span class="text" v-else>{{ todaySummarize }}</span>
        </li>
        <li>
          <h4 class="title">座右铭
            <input class="add-motto" type="text" v-model="addMotto" @blur="handleAddMotto"
                   @keyup.enter="handleAddMotto">
          </h4>
          <li class="text" v-for="(motto, index) in user.motto" :key="motto">
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
      <ul class="remote">
        <li>
          <h4>坚果云盘</h4>
          <el-form
            ref="janguoFormRef"
            style="max-width: 200px"
            :model="janguoForm"
            :rules="janguoFormRule"
            label-width="auto"
            class="demo-ruleForm"
            status-icon
          >
            <el-form-item label="账号" prop="username">
              <el-input
                v-model="janguoForm.username"
                placeholder="请输入账号"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="janguoForm.password"
                type="password"
                show-password
                placeholder="请输入密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitJanguoForm(janguoFormRef)">
                绑定
              </el-button>
              <el-button @click="resetJanguoForm(janguoFormRef)">重置</el-button>
            </el-form-item>
          </el-form>
        </li>
      </ul>
      
      <ul class="data">
        <li @click="dataExportHandle">
          <span class="iconfont icon-xiazai"></span>
          本地数据导出
        </li>
        <li>
          <span class="iconfont icon-shangchuan" @click="triggerFileUpload"></span>
          <input type="file" ref="uploadFileRef" @change="handleFile" style="display: none;"/>
          本地数据导入
        </li>
        <li @click="handelUploadCloud">
          <span class="iconfont icon-ziyuan"></span>
          <div v-if="isUploadCloud === false">本地数据上传云盘</div>
          <div v-else class="sync-text">
            数据上传中
            <div class="sync-loader"></div>
          </div>
        </li>
        <li @click="handelDownloadCloud">
          <span class="iconfont icon-yunpanlogo-_huabanfuben"></span>
          <div v-if="isDownloadCloud === false">云盘数据覆盖本地</div>
          <div v-else class="sync-text">
            数据下载中
            <div class="sync-loader"></div>
          </div>
        </li>
        <li @click="handelIncrementSync">
          <span class="iconfont icon-chanpingdaquan"></span>
          <div v-if="isIncrementSync === false">数据同步</div>
          <div v-else class="sync-text">
            数据同步中
            <div class="sync-loader"></div>
          </div>
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
import { onMounted, ref, computed, toRaw } from 'vue';
import Header from '@/components/Header.vue';
import { ElMessage, ElMessageBox } from "element-plus";
import { exportIndexedDB, importIndexedDB } from '@/db/initDB.js';
import { initStore } from '@/store/index.js';
import { storeToRefs } from 'pinia';
import { UserController } from "@/db/controller/UserController.js";
import {
  getClient,
  initClient,
  uploadFile,
  downloadFile,
  incrementSync,
} from '@/utils/webdavClient';

const userController = new UserController();
const store = initStore();
const { isDarkTheme, user } = storeToRefs(store);

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
const addMotto = ref('');

const handleAddMotto = async (event) => {
  if(addMotto.value.trim()) {
    user.value.motto.push(addMotto.value.trim());
    await userController.update(toRaw(user.value));
    
    addMotto.value = '';
    event.target.blur();
    ElMessage.success('添加成功!');
  }
}
const handleDelete = async (index) => {
  await ElMessageBox.confirm(
    '您确定要删除此句座右铭吗？',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  );
  
  user.value.motto.splice(index, 1);
  await userController.update(toRaw(user.value));
}

const handleSettingAsHeaderTitle = (motto) => {
  user.value.title = motto;
  userController.update(toRaw(user.value));
  ElMessage.success('设置成功!');
}

const isConstellationLoader = ref(false);

async function getConstellation() {
  isConstellationLoader.value = true;
  
  const apiKey = 'fc3f8344aa73785e5838bcef6f4e364c';
  const url = `/constellationApi/constellation/getAll?consName=${encodeURIComponent(consName.value)}&type=${type.value}&key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if(!response.ok) {
      throw new Error('请求失败');
    }
    const result = await response.json();
    todaySummarize.value = result.summary;
    if(todaySummarize.value) {
      isConstellationLoader.value = false;
      sessionStorage.setItem('todaySummarize', todaySummarize.value);
    }
  } catch(error) {
    console.error('请求错误:', error);
  }
}

onMounted(async () => {
  todaySummarize.value = sessionStorage.getItem('todaySummarize');
  if(!todaySummarize.value) {
    await getConstellation();
  }
})
const changeConstellation = () => {
  getConstellation();
}

// 心灵鸡汤
const isCollect = ref(false);
const carlet = ref('');

async function getCarlet() {
  const apiKey = 'b393eb0dc93d9c2b990d8aadd23137f9';
  const url = `/carletApi/fapig/soup/query?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if(!response.ok) {
      throw new Error('请求失败');
    }
    const result = await response.json();

    if(result.reason === "success") {
      carlet.value = result.result.text;
      if(carlet.value) {
        sessionStorage.setItem('carlet', carlet.value);
      }
    }
  } catch(error) {
    console.error('请求错误:', error);
  }
}

onMounted(() => {
  isCollect.value = sessionStorage.getItem('isCollect');
  carlet.value = sessionStorage.getItem('carlet');
  if(!carlet.value) {
    getCarlet();
  }
});
const isCollectHandle = () => {
  isCollect.value = !isCollect.value;
  sessionStorage.setItem('isCollect', isCollect.value);
  if(isCollect.value && carlet.value) {
    const result = user.value.motto?.filter(item => item === carlet.value)[0];
    if(result) {
      ElMessage.success('该语录已收藏');
      return;
    }
    user.value.motto.push(carlet.value);
    userController.update(toRaw(user.value));
  }
}

// 数据
const janguoFormRef = ref(null);
const janguoForm = ref({
  username: user.value.remote?.jianguo.username ?? '',
  password: user.value.remote?.jianguo.password ?? ''
});
const janguoFormRule = ref({
  username: [
    { required: true, message: '请输入账号信息', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入应用密码', trigger: 'blur' }
  ]
});

onMounted(async () => {
  setTimeout(() => {
    getClient(janguoForm.value.username, janguoForm.value.password);
  }, 0);
});
const submitJanguoForm = (formEl) => {
  if (!formEl) {
    return;
  }
  
  formEl.validate(async (valid) => {
    if(valid) {
      try {
        await initClient(janguoForm.value.username, janguoForm.value.password);
        
        user.value.remote ??= {};
        user.value.remote.janguo ??= {};
        
        user.value['remote']['janguo'].username = janguoForm.value.username;
        user.value['remote']['janguo'].password = janguoForm.value.password;
        
        await userController.update(toRaw(user.value));
        ElMessage.success('绑定成功');
      } catch(error) {
        ElMessage.error('绑定失败');
        console.log(error);
      }
    }
  });
}

const resetJanguoForm = (formEl) => {
  if (!formEl) {
    return;
  }
  
  formEl.resetFields();
}

// 导出整个indexdb数据库的数据
const dataExportHandle = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要导出全部数据吗？',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    );
    
    const data = await exportIndexedDB();
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = '人生时间管理大师.json';
    a.click();
    
    URL.revokeObjectURL(url);
  } catch(error) {
    console.error(error);
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
      ElMessage.success('数据导入成功');
    }).catch(error => {
      ElMessage.error('数据导入失败');
      console.log("数据导入失败!", error);
    })
  }
  reader.readAsText(file);
}

/**
 * 数据同步
 */
const isUploadCloud = ref(false);
const isDownloadCloud = ref(false);
const isIncrementSync = ref(false);

// 文件上传到云盘
const handelUploadCloud = async () => {
  isUploadCloud.value = true;
  
  try {
    const data = await exportIndexedDB();
    const jsonData = JSON.stringify(data);
    
    // 上传文件
    const uploadUrl = '/人生时间管理大师/人生时间管理大师.json';
    await uploadFile(uploadUrl, jsonData);
    ElMessage.success('数据上传成功');
  } catch(error) {
    ElMessage.error('数据上传失败');
    console.error(error);
  }
  isUploadCloud.value = false;
}
// 云盘文件下载到本地 (覆盖本地数据库)
const handelDownloadCloud = async () => {
  isDownloadCloud.value = true;
  
  const result = await downloadFile('/人生时间管理大师/人生时间管理大师.json');
  
  importIndexedDB(result).then(() => {
    ElMessage.success('数据导入成功');
  }).catch(error => {
    ElMessage.error('数据导入失败');
    console.log("数据导入失败!", error);
  });
  
  isDownloadCloud.value = false;
}

const handelIncrementSync = async () => {
  isIncrementSync.value = true;
  
  try {
    await incrementSync();
    ElMessage.success('数据同步成功');
  } catch(e) {
    ElMessage.error('数据同步失败');
    console.log(e);
  }
  
  isIncrementSync.value = false;
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

// 星座今日运势加载动画
.constellation-loader-container {
  position: relative;
  width: 100%;
  height: 80px;
}

.constellation-loader {
  position: absolute;
  left: 50%;
  top: 50%;
  --d: 22px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  color: #25b09b;
  box-shadow: calc(1 * var(--d)) calc(0 * var(--d)) 0 0,
  calc(0.707 * var(--d)) calc(0.707 * var(--d)) 0 1px,
  calc(0 * var(--d)) calc(1 * var(--d)) 0 2px,
  calc(-0.707 * var(--d)) calc(0.707 * var(--d)) 0 3px,
  calc(-1 * var(--d)) calc(0 * var(--d)) 0 4px,
  calc(-0.707 * var(--d)) calc(-0.707 * var(--d)) 0 5px,
  calc(0 * var(--d)) calc(-1 * var(--d)) 0 6px;
  animation: l27 1s infinite steps(8);
}

@keyframes l27 {
  100% {
    transform: rotate(1turn)
  }
}

// 数据同步动画
.sync-text {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sync-loader {
  width: 20px;
  aspect-ratio: 4;
  background: radial-gradient(circle closest-side, var(--text-color) 90%, #0000) 0/calc(100%/3) 100% space;
  clip-path: inset(0 100% 0 0);
  animation: l1 1s steps(4) infinite;
}

@keyframes l1 {
  to {
    clip-path: inset(0 -34% 0 0)
  }
}
</style>