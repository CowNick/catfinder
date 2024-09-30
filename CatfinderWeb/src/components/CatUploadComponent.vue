<template>
  <div v-show="menuVisible" class="custom-menu" :style="menuStyle">
    <el-menu>
      <el-menu-item @click="showUploadPanel">上传猫星人</el-menu-item>
      <!-- 可以添加更多菜单项 -->
    </el-menu>
  </div>

  <el-drawer v-model="drawerVisible" direction="btt">
    <template #title>
      <h3>上传猫星人照片</h3>
    </template>
    <el-upload
      class="upload-demo"
      action="#"
      :auto-upload="false"
      :on-change="handleFileChange"
    >
      <el-button type="primary">选择照片</el-button>
    </el-upload>
    <div v-if="imageUrl" class="image-preview" :style="{ width: '50%' }">
      <img :src="imageUrl" alt="Preview" style="width: 100%;" />
    </div>
    <el-input
      v-model="description"
      type="textarea"
      :rows="4"
      placeholder="您可以在这里添加这张照片的描述"
    />
    <el-button type="primary" @click="submitPhoto">提交</el-button>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMenu, ElMenuItem, ElDrawer, ElUpload, ElInput } from 'element-plus'

const menuVisible = ref(false)
const drawerVisible = ref(false)
const menuPosition = ref({ x: 0, y: 0 })

const menuStyle = computed(() => ({
  position: 'fixed',
  left: `${menuPosition.value.x}px`,
  top: `${menuPosition.value.y}px`,
  zIndex: 2000
}))

const showMenu = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
  menuPosition.value = { x: clientX, y: clientY }
  menuVisible.value = true
}

const showUploadPanel = () => {
  menuVisible.value = false
  drawerVisible.value = true
}

const handleFileChange = (file: any) => {
  //imageUrl.value = URL.createObjectURL(file.raw)
}

const submitPhoto = () => {
  // TODO: 实现提交逻辑
  //console.log('提交照片:', imageUrl.value, description.value)
  drawerVisible.value = false
  // 触发关闭事件
  emit('close')
}

const emit = defineEmits(['close'])

const hideMenu = () => {
  menuVisible.value = false
  drawerVisible.value = false
}

defineExpose({ showMenu, hideMenu })
</script>

<style scoped>
.custom-menu {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
</style>
