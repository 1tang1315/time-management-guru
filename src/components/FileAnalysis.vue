<template>
  <div class="file-upload-container">
    <input type="file" id="fileInput" @change="handleFileUpload" />
    <label for="fileInput" class="upload-label">
      <div class="plus-icon">+</div>
    </label>
    <div v-if="uploadedFile" class="file-display">
      <img :src="fileIcon" alt="File Icon" class="file-icon" />
      <span class="file-name">{{ uploadedFile.name }}</span>
    </div>
  </div>

  <iframe v-show="true" ref="pdfIframe" id="pdfViewerIframe" style="width:100%; height:100vh;"></iframe>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;



const allText = ref('');
const allImageText = ref('');
const pdfIframe = ref(null);
const images = [];  // 用于存储图片
const extractedTexts = [];


const loadAllPagesAndExtractText = async () => {
  try {
    const pdfPath = new URL('../assets/everyDay.pdf', import.meta.url).href;
    const loadingTask = pdfjsLib.getDocument(pdfPath);

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // 获取文本
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      // 提取文本内容
      const textContent = await page.getTextContent();
      let textItems = textContent.items;
      allText.value = textItems.map(item => item.str).join(' ');
      console.log(allText.value)

      // 提取图片
      const ops = await page.getOperatorList(); // pdf操作指令列表
      // pdfjsLib.OPS.paintImageXObject: pdf的图片绘制指令
      const imageNames = ops.fnArray.reduce((acc, curr, i) => {
        if ([pdfjsLib.OPS.paintImageXObject, pdfjsLib.OPS.paintJpegXObject].includes(curr)) {
          acc.push(ops.argsArray[i][0]);
        }
        return acc;
      }, []);
      for (const imageName of imageNames) {
        page.objs.get(imageName, (image) => {
          (async function() {
            const bmp = image.bitmap;
            // OffscreenCanvas
            const resizeScale = 1 / 4; // 这个可以控制转换后的图片大小
            const width = bmp.width * resizeScale;
            const height = bmp.height * resizeScale;
            const canvas = new OffscreenCanvas(width, height);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(bmp, 0, 0, width, height);

            // 获取图像数据进行进一步检查
            const imageData = ctx.getImageData(0, 0, width, height);
            const { data } = imageData;
            let hasContent = false;

            // 获取第一个像素的颜色
            const firstPixelColor = [data[0], data[1], data[2], data[3]];

            // 检查图像数据是否有内容
            for (let i = 0; i < data.length; i += 4) {
              if (data[i] !== firstPixelColor[0] ||
                data[i + 1] !== firstPixelColor[1] ||
                data[i + 2] !== firstPixelColor[2] ||
                data[i + 3] !== firstPixelColor[3]) {
                hasContent = true;
                break;
              }
            }

            if (!hasContent) {
              return; // 如果图像是空白，则跳过
            }

            // 把 canvas 画布转化为 Blob 对象
            const blob = await canvas.convertToBlob();
            // 最后使用 Blob 作为 URL.createObjectURL 的参数，渲染出 img 图片
            // 如果不需要渲染，则可以将 Blob 数据上传到云存储
            const img = document.body.appendChild(new Image());
            img.width = width;
            img.height = height;
            img.src = URL.createObjectURL(blob);
          })();
        });
      }
    }
  } catch (err) {
    console.error('Failed to load PDF:', err);
  }
};


onMounted(() => {
  const viewerUrl = new URL('/pdfjs-4.4.168-dist/web/viewer.html', import.meta.url).href;
  pdfIframe.value.src = `${viewerUrl}?file=${encodeURIComponent('/static/everyDay.pdf')}`;
  loadAllPagesAndExtractText();
  console.log(allText.value)
});


const uploadedFile = ref(null);
const fileIcon = ref('');

const handleFileUpload = (event) => {
  uploadedFile.value = event.target.files[0];
  setFileIcon();
}

const setFileIcon = () => {
  const fileExtension = uploadedFile.value.name.split('.').pop().toLowerCase();
  console.log(fileExtension)
  switch (fileExtension) {
    case 'pdf':
      fileIcon.value = 'src/assets/images/pdf.jpg';
      break;
    case 'jpg':
    case 'jpeg':
    case 'png':
      fileIcon.value = 'path/to/image-icon.png';
      break;
    case 'md':
      fileIcon.value = 'src/assets/images/markdown.jpg';
      break;
    default:
      fileIcon.value = 'path/to/default-file-icon.png';
  }
}
</script>


<style scoped lang="scss">
#progress-bar-container {
  width: 100%;
  background-color: #f3f3f3;
  border-radius: 25px;
  overflow: hidden;
}

#progress-bar {
  width: 0%;
  height: 30px;
  background-color: #4caf50;
  text-align: center;
  line-height: 30px;
  color: white;
}

#pdfViewerContainer {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

#pdfViewerIframe {
  border: none;
}

.pdfCanvas {
  width: 1000px;
}

.file-upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

input[type="file"] {
  display: none;
}

.upload-label {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  border: 2px dashed #ccc;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.upload-label:hover {
  border-color: #888;
}

.plus-icon {
  font-size: 48px;
  color: #ccc;
  user-select: none;
  pointer-events: none;
}

.upload-label:hover .plus-icon {
  color: #888;
}

.file-display {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.file-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.file-name {
  font-size: 16px;
}
</style>
