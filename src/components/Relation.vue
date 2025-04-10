<template>
  <NaviBar/>
  <div class="content-main">
    <div class="mbti-content">
      <a-tooltip v-for="(mbti,index) in mbtiList" :key="index" placement="right" :overlayInnerStyle="{ fontSize: '0.8em', padding: '4px 8px' }">
        <template #title>
          <span>
            {{ mbti.title }}
            <br>
            {{ mbti.content }}
          </span>
        </template>
        <div class="mbti-item" :class="{'mbti-sel':editPerson.mbti_type.includes(mbti.name)}" @click="selMbti(mbti)"><span>{{ mbti.name }}</span></div>
      </a-tooltip>
    </div>
    <div class="person-list">
      <a-list size="small" :data-source="personList" class="scroll">
        <template #renderItem="{ item }">
          <a-list-item class="person-item" :class="{'sel-item':selPersonId===item.id}" @click="personItemCli(item) ">{{ item.name }}</a-list-item>
        </template>
      </a-list>
    </div>
    <div class="person-content">
      <div class="edit-top">
        <div style="width: 4em;display: flex">
          <a-input class="edit-name-input"  size="small" v-model:value="editPerson.name" placeholder="姓名" spellcheck="false"></a-input>
        </div>
        <div class="page-navi">
          <span class="cursor-default hoverActive" :class="{'active-blue':currPage.page1 ==='base'}" @click="currPage.page1='base'"><AimOutlined/></span>
          <LineOutlined/>
          <span class="cursor-default hoverActive" :class="{'active-blue':currPage.page1 ==='other'}" @click="currPage.page1='other'"><AimOutlined/></span>
          <LineOutlined/>
          <span class="cursor-default hoverActive" :class="{'active-blue':currPage.page1 ==='mbti'}" @click="currPage.page1='mbti'"><AimOutlined/></span>
          <!-- <LineOutlined/> -->
          <!-- <span class="cursor-default hoverActive" :class="{'active-blue':currPage.page1 ==='result'}" @click="currPage.page1='result'"><AimOutlined/></span> -->
        </div>
        <div>
          <SaveOutlined v-show="editPerson.uuid" class="hoverActive" @click="savePersonRel"/>
          <PlusCircleOutlined v-show="!editPerson.uuid"  class="hoverActive"  @click="savePersonRel"/>
        </div>
        <div>
          <ClearOutlined class="hoverActive" @click="clearEditContent" />
        </div>
        <div>
          <DeleteOutlined v-show="editPerson.uuid" class="hoverActive" @click="deletePersonRel"  />
        </div>
      </div>
      <div v-show="currPage.page1==='base'" class="edit-content">
        <div class="edit-col">
          <!-- 性别 -->
          <div class=" " style="width: 3em">
            <a-tooltip placement="right" trigger="click" :open="genderSelTooltipShow" :overlayInnerStyle="{ fontSize: '0.8em', padding: '4px 8px' }">
              <template #title>
                <a-radio-group v-model:value="editPerson.gender" name="radioGroup" @change="genderSelTooltipShow=false">
                  <a-radio value="男" style="color: white;font-size: small">男</a-radio>
                  <a-radio value="女" style="color: white;font-size: small">女</a-radio>
                </a-radio-group>
              </template>
              <a-input class="edit-input cursor-default" size="small" v-model:value="editPerson.gender" @blur="genderInputBlur" @click="genderSelTooltipShow=true" placeholder="性别"></a-input>
            </a-tooltip>
          </div>
          <!-- 关系 -->
          <div  style="width: 3em">
            <a-tooltip class="tool-item">
              <a-popover trigger="click" v-model:open="relationshipVisible" placement="right">
                <template #content >
                  <div style="height: 120px;margin: -6px">
                    <a-tree
                      class="scoll formatTree"
                      v-model:selectedKeys="relationSelectedKeys"
                      v-model:expandedKeys="relationExpandedKeys"
                      :tree-data="normalRelationTree"
                      size="small"
                      @select="selTree"
                    >
                    <template #switcherIcon="{ switcherCls, key }">
                      <CaretDownOutlined :class="switcherCls" @mouseenter="relationExpandedKeys=[key]"/>
                    </template>
                    </a-tree>
                  </div>
                </template>
                <a-input class="edit-input" size="small" v-model:value="editPerson.relationship" placeholder="关系"></a-input>
              </a-popover>
            </a-tooltip>
          </div>
          <!-- 出生 --> 
          <div  style="width: 5.3em">
            <a-tooltip placement="right" trigger="click" :visible="birthSelTooltipShow" :overlayInnerStyle="{ padding: '4px 8px' }">
              <template #title>
                <span class="cursor-default" @wheel="wheelBirthTime($event, 0)">{{editBirth[0]}}</span>
                <span class="cursor-default" @wheel="wheelBirthTime($event, 1, [1,12])">{{`/${String(editBirth[1]).padStart(2, '0')}`}}</span>
                <span class="cursor-default" @wheel="wheelBirthTime($event, 2, [1,31])">{{`/${String(editBirth[2]).padStart(2, '0')}`}}</span>
              </template>
              <a-input class="edit-input cursor-default" size="small" v-model:value="editPerson.birth_date" @blur="setBirthToEdit()" @click="birthInputCli" placeholder="出生日期"></a-input>
            </a-tooltip>
          </div>
        </div>
        <div class="edit-col">
          <!-- 年龄/类型/地址 -->
          <div  style="width: 3em"><a-input class="edit-input cursor-default" size="small" :value="editAge" placeholder="年龄"></a-input></div>
          <div  style="width: 3em"><a-input class="edit-input cursor-default" size="small" v-model:value="editPerson.mbti_type" placeholder="类型" ref="mbtiInput" @blur="mbtiInputBlur"></a-input></div>
          <div  style="width: 8em"><a-input class="edit-input" size="small" v-model:value="editPerson.location" placeholder="地址"></a-input></div>
        </div>
      </div>
      <!-- likes -->
      <div v-show="currPage.page1==='other'" class="edit-content">
        <div class="edit-col" style="width: 20%">
          <div v-for="(rowItem, index) in page2Item" class="edit-row" :key="index">
            <div
              v-for="(item, index2) in rowItem"
              :key="index2"
              class=" page2-item"
              :class="{'active-page2-item':currPage.page2===item.key || currPage.page2Lock.page === item.key}" 
              @mouseleave="leaveChangePage2(item.key)" 
              @mouseenter="hoverChangePage2(item.key)" 
              @click="changePage2(item.key)"
              >
              <span>{{ item.title }}</span>
            </div>
          </div>
        </div>
        <div class="edit-col" style="width: 80%">
          <div >
            <a-textarea v-show="currPage.page2==='likes'" class="textarea-part" :rows="4" v-model:value="editPerson.likes" :bordered="false" placeholder="likes" />
            <a-textarea v-show="currPage.page2==='dislikes'" class="textarea-part" :rows="4" v-model:value="editPerson.dislikes" :bordered="false" placeholder="dislikes" />
            <a-textarea v-show="currPage.page2==='stories'" class="textarea-part" :rows="4" v-model:value="editPerson.stories" :bordered="false" placeholder="stories" />
            <a-textarea v-show="currPage.page2==='intersections'" class="textarea-part" :rows="4" v-model:value="editPerson.intersections" :bordered="false" placeholder="intersections" />
            <a-textarea v-show="currPage.page2==='avoid'" class="textarea-part" :rows="4" v-model:value="editPerson.avoid" :bordered="false" placeholder="avoid" />
            <a-textarea v-show="currPage.page2==='active'" class="textarea-part" :rows="4" v-model:value="editPerson.active" :bordered="false" placeholder="active" />
          </div>
        </div>
      </div>
      <div v-show="currPage.page1==='mbti'" class="edit-content">
        <div class="edit-col" style="width: 100%">
          <div class="mbti-desc">
            <div style="font-weight: 600">{{ mbtiInfo[editPerson.mbti_type]?.name }}</div>
            <div style="text-indent: 1em">{{ mbtiInfo[editPerson.mbti_type]?.traits }}</div>
            <div style="text-indent: 1em;color: #ff6363">{{ mbtiInfo[editPerson.mbti_type]?.interaction_tips }}</div>
            <!-- <a-textarea class="textarea-part" :rows="4" :value="mbtiDesc" :bordered="false" placeholder="mbti描述" /> -->
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch,onUnmounted, onMounted, onBeforeUnmount, computed } from "vue";
import "../style/main.less";
import NaviBar from "./module/NaviBar.vue";
import utils from "../js/utils";
import { CaretDownOutlined,AimOutlined,LineOutlined,SaveOutlined,PlusCircleOutlined,MinusCircleOutlined,ClearOutlined,DeleteOutlined } from '@ant-design/icons-vue'

// 数据
const selPersonId = ref(-1)
const currPage = reactive({
  page1: 'base',
  page2: 'likes',
  page2Lock: {lock: false, page: ''}
})
const page2Item = [
  [{key: 'likes', title: '喜'}, {key: 'dislikes', title: '厌'}],
  [{key: 'stories', title: '事'}, {key: 'intersections', title: '交'}],
  [{key: 'avoid', title: '避'}, {key: 'active', title: '先'}],
]
const mbtiInput = ref(null)
const genderSelTooltipShow = ref(false)
const birthSelTooltipShow = ref(false)
const relationExpandedKeys = ref([]);
const relationSelectedKeys = ref([]);
const relationshipSelTooltipShow = ref(false)
const editBirth = ref([2000,6,15])
const normalRelationTree = [
  {
    title: '家庭',
    key: '家庭',
    children: [
      { title: '父亲', key: '父亲' },
      { title: '母亲', key: '母亲' },
      { title: '配偶', key: '配偶' },
      { title: '儿子', key: '儿子' },
      { title: '女儿', key: '女儿' },
      { title: '兄弟', key: '兄弟' },
      { title: '姐妹', key: '姐妹' }
    ]
  },
  {
    title: '亲戚',
    key: '亲戚',
    children: [
      { title: '祖父', key: '祖父' },
      { title: '祖母', key: '祖母' },
      { title: '外祖父', key: '外祖父' },
      { title: '外祖母', key: '外祖母' },
      { title: '孙子', key: '孙子' },
      { title: '孙女', key: '孙女' },
      { title: '外孙', key: '外孙' },
      { title: '外孙女', key: '外孙女' },
      { title: '岳父', key: '岳父' },
      { title: '岳母', key: '岳母' },
      { title: '公公', key: '公公' },
      { title: '婆婆', key: '婆婆' },
      { title: '叔叔', key: '叔叔' },
      { title: '婶婶', key: '婶婶' },
      { title: '舅舅', key: '舅舅' },
      { title: '舅妈', key: '舅妈' },
      { title: '姑姑', key: '姑姑' },
      { title: '姑父', key: '姑父' },
      { title: '姨妈', key: '姨妈' },
      { title: '姨父', key: '姨父' },
      { title: '侄子', key: '侄子' },
      { title: '侄女', key: '侄女' }
    ]
  },
  {
    title: '以及',
    key: '以及',
    children: [
      { title: '朋友', key: '朋友' },
      { title: '同事', key: '同事' },
      { title: '邻居', key: '邻居' },
      { title: '其他', key: '其他' }
    ]
  }
]
const mbtiList = ref([
  {name:'E',opposite:'I',title:'外向型',content:'通过社交获取能量, 喜欢讨论'},
  {name:'I',opposite:'E',title:'内向型',content:'通过独处恢复能量，偏好书面沟通'},
  {name:'N',opposite:'S',title:'直觉型',content:'关注宏观理念，喜欢隐喻'},
  {name:'S',opposite:'N',title:'实感型',content:'关注具体事实，喜欢步骤'},
  {name:'T',opposite:'F',title:'思考型',content:'决策重逻辑，可能显得冷漠'},
  {name:'F',opposite:'T',title:'情感型',content:'决策重和谐，易回避冲突'},
  {name:'J',opposite:'P',title:'判断型',content:'计划性强，讨厌意外'},
  {name:'P',opposite:'J',title:'感知型',content:'灵活随性，讨厌约束'}
])
const personList = ref([])
let editPerson = reactive({
  id:0,
  uuid:'',
  name:'',
  gender:'',
  birth_date:'',
  location:'',
  relationship:'',
  contact_info:'',
  mbti_type:'',
  likes:'',
  dislikes:'',
  intersections:'',
  stories:'',
  first_meet_date:'',
  notes:'',
  avoid:'',
  active:''
})
const mbtiInfo = ref({})
const relationshipVisible = ref(false)
let blurMbtiInput = false
// 方法:
const genderInputBlur = () => {
  setTimeout(() => {
    genderSelTooltipShow.value = false
  }, 200);
}
const selTree = (keys, e) => {
  if (e.node && !e.node.children) {
    editPerson.relationship = e.node.key
    relationshipVisible.value = false
  }
}
const birthInputCli = () => {
  birthSelTooltipShow.value = true
  if (editPerson.birth_date){
    editBirth.value[0] = Number(editPerson.birth_date.split('-')[0])
    editBirth.value[1] = Number(editPerson.birth_date.split('-')[1])
    editBirth.value[2] = Number(editPerson.birth_date.split('-')[2])
  }
}
const mbtiInputBlur = () => {
  blurMbtiInput = true
  setTimeout(() => {
    blurMbtiInput = false
  }, 200);
}
const wheelBirthTime = (event, index, limit) => {
  const newNum = editBirth.value[index] - Math.floor(event.deltaY/100)
  if (limit && newNum<=limit[1] && newNum>=limit[0] || !limit) {
    editBirth.value[index] = newNum
  }
}
const setBirthToEdit = () => {
  birthSelTooltipShow.value = false
  const year = editBirth.value[0]
  const month = editBirth.value[1]
  const day = editBirth.value[2]
  editPerson.birth_date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
const selMbti = async (mbti) => {
  const order = 'EINSTFJP'
  if (blurMbtiInput) {
    // 修改mbti
    if (editPerson.mbti_type.includes(mbti.name)) {
      editPerson.mbti_type = editPerson.mbti_type.replace(mbti.name, '')
      console.log(333, editPerson.mbti_type);
    } else if (editPerson.mbti_type.includes(mbti.opposite)) {
      editPerson.mbti_type = editPerson.mbti_type.replace(mbti.opposite, mbti.name)
      console.log(333, editPerson.mbti_type);
    } else {
      const mbtiTemp = editPerson.mbti_type + mbti.name
      editPerson.mbti_type = mbtiTemp.split('').sort((a,b) => order.indexOf(a) - order.indexOf(b)).join('')
      console.log(333, editPerson.mbti_type);
    }
    mbtiInput.value?.focus()
  } else {
    return
  }
}
const savePersonRel = async () => {
  if (!editPerson.name) {
    return
  }
  console.log(editPerson);
  const result = await window.electron.savePersonRel({...editPerson})
  await getPersonRelList()
  if (result.uuid) {
    const person = personList.value.find(item => item.uuid === result.uuid)
    resetEditContent(person)
  }
}
const clearEditContent = () => {
  selPersonId.value = -1
  resetEditContent()
}

const resetEditContent = (item) => {
  if (item) {
    editPerson.id = item.id
    editPerson.uuid = item.uuid
    editPerson.name = item.name
    editPerson.gender = item.gender
    editPerson.birth_date = item.birth_date
    editPerson.location = item.location
    editPerson.relationship = item.relationship
    editPerson.contact_info = item.contact_info
    editPerson.mbti_type = item.mbti_type
    editPerson.likes = item.likes
    editPerson.dislikes = item.dislikes
    editPerson.intersections = item.intersections
    editPerson.stories = item.stories
    editPerson.first_meet_date = item.first_meet_date
    editPerson.notes = item.notes
    editPerson.avoid = item.avoid
    editPerson.active = item.active
    return
  }
  editPerson.id = 0
  editPerson.uuid = ''
  editPerson.name = ''
  editPerson.gender = ''
  editPerson.birth_date = ''
  editPerson.location = ''
  editPerson.relationship = ''
  editPerson.contact_info = ''
  editPerson.mbti_type = ''
  editPerson.likes = ''
  editPerson.dislikes = ''
  editPerson.intersections = ''
  editPerson.stories = ''
  editPerson.first_meet_date = ''
  editPerson.notes = ''
  editPerson.avoid = ''
  editPerson.active = ''
}
const deletePersonRel = async () => {
  await window.electron.deletePersonRel(editPerson.uuid)
  getPersonRelList()
  resetEditContent()
}
const personItemCli = (item) => {
  selPersonId.value = item.id
  console.log(444,selPersonId.value, item.id );
  resetEditContent(item)
}
const getPersonRelList = async () => {
  const list = await window.electron.search({name:'getPersonRelList'})
  console.log(1, list);
  personList.value = list
}
const editAge = computed(() => {
  if (!editPerson.birth_date) return null
  const year = new Date().getFullYear()
  const birthYear = editPerson.birth_date.split('-')[0]
  return (Number(year) - Number(birthYear))+'岁'
})
const mbtiDesc = computed(() => {
  if (!editPerson.mbti_type) return null
  const info = mbtiInfo.value[editPerson.mbti_type]
  if (!info) return null
  return `${info.name}/n/t${info.traits}/n${info.interaction_tips}`
})
const changePage2 = (page) => {
  const lock = currPage.page2Lock.lock
  const lockPage = currPage.page2Lock.page
  if (lock && page === lockPage) {
    currPage.page2Lock.lock = false
    currPage.page2Lock.page = ''
  } else if (lock && page !== lockPage) {
    currPage.page2Lock.page = page
  } else if (!lock) {
    currPage.page2Lock.lock = true
    currPage.page2Lock.page = page
  }
  currPage.page2 = page
}
const hoverChangePage2 = (page) => {
  currPage.page2 = page
  if(!currPage.page2Lock.lock) {
    currPage.page2 = page
  }
}
const leaveChangePage2 = (page) => {
  if (currPage.page2Lock.lock) {
    currPage.page2 = currPage.page2Lock.page
  }
}
onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  window.electron.resizeWindow([420,180])
  getPersonRelList()
  mbtiInfo.value = utils.getMbtiInfo()
})

</script>

<style scoped  lang="less">
.content-main {
  height: 150px;
  margin: 0 5px 5px 5px;
  display: flex;
}
.mbti-content {
  margin: 5px;
  padding: 5px;
  width: 15%;
  background-color: rgb(231, 244, 255);
  display: grid; //定义网格布局
  grid-template-columns: 1fr  1fr; 
  // minmax定义最小, 最大尺寸
  // fr: 平均分配剩余空间
  // 表示四列, 第一列最小100px, 第二列占2份空间
  gap: 5px; // 间距
  .mbti-item { // 子元素div
    background-color: rgb(183, 223, 255);
    border-radius: 3px;
    display: flex;
    &:hover {
      background-color: rgb(137, 202, 255);
      cursor: default;
    }
    span {
      margin: auto;
    }
  }
  .mbti-sel {
    background-color: rgb(137, 202, 255);
  }
}
.scroll {
  height: 136px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 0px;  /* 隐藏垂直滚动条 */
    height: 0px;  /* 隐藏水平滚动条 */
  }
}
.person-list {
  width: 20%;
  margin: 5px 0;
  background-color: rgb(255, 244, 228);
  .person-item {
    background-color: rgb(255, 235, 205);
    border-radius: 3px;
    padding: 3px;
    margin: 4px;
    cursor: default;
    &:hover {
      background-color: rgb(255, 226, 182);
    }
  }
  .sel-item {
    background-color: rgb(255, 226, 182);
  }
}
.person-content {
  display: flex;
  flex-direction: column;
  width: 65%;
  min-width: 235px;
  margin: 5px 5px;
  background-color: #ccdeff;
  .edit-top {
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    margin-top: 3px;
    margin: 3px;
  }
}
.page-navi {
  border-radius: 10%;
  padding: 0 3px;
  margin: auto 3px;
}
.save-btn {
  border: none;
  background-color: #d0d1ff;
}
.edit-input {
  border: none;
  width: 100%;
  background-color: rgb(255, 255, 255);
  min-width: 2.5em;
  // max-width: 7em;
  border-radius: 3px;
  margin-left: 0;
  &:focus{
    outline: none;
    box-shadow: none;
  }
}
.edit-name-input {
  border: none;
  width: 100%;
  min-width: 2.5em;
  // max-width: 7em;
  border-radius: 3px;
  margin-left: 0;
  &:focus{
    outline: none;
    box-shadow: none;
  }
}
.edit-content {
  height: 100%;
  background-color: rgb(239, 233, 255);
  display: flex;
  .edit-col {
    width: 50%;
    margin: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .textarea-title {
    }
    .edit-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
  }
}
.likes-distextarea-part {
  display: flex;
}
.textarea-part {
  background-color: white;
  width: 100%;
  height: 100%;
  overflow: auto;
  font-size: 0.7em;
  padding: 2px;
  resize: none;
  margin-right: 3px;
  &::-webkit-scrollbar {
    width: 0px;  /* 隐藏垂直滚动条 */
    height: 0px;  /* 隐藏水平滚动条 */
  }
}
.page2-item {
  background-color: #ffffff;
  border-radius: 2px;
  padding: 0 3px;
  cursor: default;
  font-size: small;
  &:hover {
    background-color: #77b7ff;
  }
}
.active-page2-item {
  background-color: #77b7ff
}
.mbti-desc {
  padding: 2px;
  font-size: small;
  text-align: left;
  height: 96px;
  overflow: auto;
  background-color: white;
  &::-webkit-scrollbar {
    width: 0px;  /* 隐藏垂直滚动条 */
    height: 0px;  /* 隐藏水平滚动条 */
  }
}
</style>
