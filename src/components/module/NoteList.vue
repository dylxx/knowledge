<template  style="height: 200px">
  <a-list  class="main-list" size="small" bordered :data-source="dataList" :split="false" style="border: none" :locale="{emptyText: '暂无数据'}">
    <template #renderItem="{ item }">
      <div class="main-list-item" draggable="true" @dragstart="onDragStartNote($event,item)" @mouseenter="showDelete(item.id)" @mouseleave="hoverItem = -1" @click="toParent('clickItem', item)">
        <a-list-item   :class="{'list-item':true,'selectedNote':editNote === item.id}">
          <div style="display: flex; flex-direction: row">
            <div class="itemList-title">{{ item.title || item.name }}</div>
          </div>
          <div class="list-item-time">
            <span v-show="item.id !== hoverItem">{{ item.createtime.slice(-8) }}</span>
            <!-- <a-tooltip v-if="true" > -->
              <a-tooltip v-if="item.id === hoverItem" >
              <slot name="content" :item="item"></slot>
            </a-tooltip>
          </div>
        </a-list-item>
      </div>
    </template>
  </a-list>
</template>

<script setup>
import { CloseCircleOutlined,MinusCircleOutlined } from '@ant-design/icons-vue'
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount, h } from "vue";
// import { settingFilled, StarFilled, StarTwoTone } from 'ant-design/icons-vue';
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router';
import { message } from "ant-design-vue";

// 数据
defineProps({
  dataList: Array,  // 接收 `msg` 字符串
});
let editNote = ref(-1)
let hoverItem = ref(-1)
const emit = defineEmits(['clickItem'])
// methods
const showDelete = (id) => {
  hoverItem.value = id
}

const toParent = (methodName, item) => {
  emit(methodName, item)
}

const onDragStartNote = (event, note) => {
  event.dataTransfer.setData('noteUUID', note.uuid)
}



onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {

})

</script>

<style scoped  lang="less">
.main-list {
  height: 95%;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 0px;  /* 隐藏垂直滚动条 */
    height: 0px;  /* 隐藏水平滚动条 */
  }
  margin: 4px;
  .main-list-item{
    border-radius: 6px;
    :hover {
      background-color: #c2d5ff;
    }
    &:hover .itemList-title {
      max-width: 8em;
    }
  }
}

    
.itemList-title {
  margin-right: 1em;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 9em;
  font-size: 1em;
}

.list-item {
  // padding-right: 4px !important;
  background-color: #dfe4f9;
  border-radius: 6px;
  margin: 4px;
  display: flex;
  flex-direction: row;
  justify-content:space-between;
  height: 34px;
  span {
    font-size: 0.8em;
  }
  .itemList-title {
    margin-right: 1em;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 11em;
    font-size: 1em;
  }
  .list-item-time {
    display: flex;
    flex-direction: row;
    justify-content: center;
    /* align-self: auto; */
    align-items: center;
    font-size: 0.8em;
  }
}
.selectedNote {
  background-color: #c2d5ff !important;
  :hover {
    background-color: #c2d5ff !important;
  }
}
</style>
