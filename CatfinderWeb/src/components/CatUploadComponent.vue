<template>
  <div v-show="menuVisible" class="custom-menu" :style="menuStyle">
    <el-menu>
      <el-menu-item @click="showUploadPanel">上传猫星人</el-menu-item>
      <!-- 可以添加更多菜单项 -->
    </el-menu>
  </div>

  <el-drawer 
    v-model="drawerVisible" 
    direction="btt"
    :size="drawerHeight"
  >
    <template #title>
      <h3>上传猫咪照片</h3>
    </template>
    <div class="drawer-content">
      <div class="upload-area">
        <el-upload
          v-model:file-list="fileList"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :limit="3"
          list-type="picture-card"
          :auto-upload="false"
          class="cat-upload"
        >
          <template #trigger>
            <el-button v-if="fileList.length < 3">
              <el-icon><Plus /></el-icon>
              选择图片
            </el-button>
            <el-button v-else disabled>
              已达上限
            </el-button>
          </template>
          <template #default>
            <div class="el-upload__tip">
              已上传 {{ fileList.length }}/3 张图片
            </div>
          </template>
        </el-upload>
        <el-input
          v-model="description"
          type="textarea"
          :rows="4"
          placeholder="请输入描述"
        ></el-input>
      </div>
      <div class="submit-area">
        <el-button type="primary" @click="submitPhoto">上传</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMenu, ElMenuItem, ElDrawer, ElUpload, ElInput, ElButton, ElIcon, ElMessage, type UploadFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import Point from '@arcgis/core/geometry/Point';
import { getAxiosWrapper } from "@/axios/axios"
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils'; // Import all named exports

const menuVisible = ref(false)
const drawerVisible = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const description = ref('')
const fileList = ref<UploadFile[]>([])
let mapPoint: Point | undefined = undefined;

const menuStyle = computed(() => ({
  position: 'fixed',
  left: `${menuPosition.value.x}px`,
  top: `${menuPosition.value.y}px`,
  zIndex: 2000
}))

const drawerHeight = computed(() => {
  return `${window.innerHeight * 0.75}px`
})

const showMenu = ({ clientX, clientY, point }: { clientX: number; clientY: number, point: Point }) => {
  menuPosition.value = { x: clientX, y: clientY }
  menuVisible.value = true
  mapPoint = point
}

const hideMenu = () => {
  menuVisible.value = false
  drawerVisible.value = false
}

watch(drawerVisible, (newValue) => {
  if (!newValue) {
    fileList.value = []
  }
})

const showUploadPanel = () => {
  menuVisible.value = false
  drawerVisible.value = true
}

const handleFileChange = (file: UploadFile) => {
  if (file.status === 'ready') {
    fileList.value.push(file)
  }
}

const handleFileRemove = (file: UploadFile) => {
  const index = fileList.value.indexOf(file)
  if (index !== -1) {
    fileList.value.splice(index, 1)
  }
}


const submitPhoto = async () => {
  if (fileList.value.length === 0) {
    ElMessage.error('请先上传至少一张图片');
    return;
  }

  const formData = new FormData();

  // Append each file in the fileList to the FormData with the same key 'files'
  fileList.value.forEach(file => {
    if (file.raw) { // Check if file.raw is defined
      formData.append('files', file.raw); // Use 'files' to match the expected parameter name for multiple files
    }
  });

  const catDTO = {
    Description: description.value,
    Xcoord: mapPoint ? webMercatorUtils.lngLatToXY(mapPoint.x, mapPoint.y)[0] : undefined, // Convert to Web Mercator
    Ycoord: mapPoint ? webMercatorUtils.lngLatToXY(mapPoint.x, mapPoint.y)[1] : undefined, // Convert to Web Mercator
 };

  formData.append('cat', JSON.stringify(catDTO));

  try {
    const axiosInstance = getAxiosWrapper();
    const response = await axiosInstance.post('api/CatPictures', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 201) {
      console.log('提交照片成功', response.data);
      // Handle success (e.g., show a success message, reset form, etc.)
    }
  } catch (error) {
    console.error('提交照片失败', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    drawerVisible.value = false;
    fileList.value = [];
    description.value = '';
  }
}

defineExpose({ showMenu, hideMenu })
</script>

<style scoped>
.custom-menu {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.upload-area {
  flex-grow: 1;
  overflow-y: auto;
}

.submit-area {
  border-top: 1px solid #e0e0e0;
  text-align: right;
}

.el-input {
  margin-top: 20px;
}

.el-textarea__inner {
  min-height: 120px !important;
}

.upload-demo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.cat-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cat-upload :deep(.el-upload-list) {
  width: 100%;
}

.cat-upload :deep(.el-upload-list__item) {
  transition: none;
}
</style>
