import { onMounted, onBeforeUnmount, ref } from "vue";
import {exportIndexedDB, importIndexedDB} from "@/db/initDB.js";
import {downloadFile, uploadFile} from "@/utils/webdavClient.js";
import { ElMessage } from "element-plus";

/**
 * 同步数据(利用云盘进行同步)
 */
// TODO 这个函数没有使用, 先保留
export function useSync() {
  // 项目启动触发事件
  onMounted(async () => {
    // await handelDownloadCloud();
  });


  // 云盘数据覆盖本地数据库
  const isUploadCloud = ref(false);
  const isDownloadCloud = ref(false);

  // 文件上传到云盘
  const handelUploadCloud = async () => {
    isUploadCloud.value = true;
    console.log('文件上传');

    try {
      const data = await exportIndexedDB();
      const jsonData = JSON.stringify(data);

      const blob = new Blob([jsonData], {type: 'application/json'});

      // 上传文件
      const uploadUrl = '/人生时间管理大师/人生时间管理大师.json';
      await uploadFile(uploadUrl, blob);
      ElMessage.success('上传成功');
    } catch (error) {
      console.error(error);
    }
    isUploadCloud.value = false;
    console.log('文件上传成功');
  }

  // 云盘文件下载到本地 (覆盖本地数据库)
  const handelDownloadCloud = async () => {
    isDownloadCloud.value = true;
    console.log('文件下载成功');

    const result = await downloadFile('/人生时间管理大师/人生时间管理大师.json');

    importIndexedDB(result).then(() => {
      ElMessage.success('数据导入成功');
    }).catch(error => {
      ElMessage.error('数据导入失败');
      console.log("数据导入失败!", error);
    });

    isDownloadCloud.value = false;
    console.log('文件下载成功');
  }
}