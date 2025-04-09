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
        <div class="mbti-item" :class="{'mbti-sel':editPerson.mbti_type.includes(mbti.name)}" @click="selMbti(mbti)">{{ mbti.name }}</div>
      </a-tooltip>
    </div>
    <div class="person-list">
      <a-list size="small" :data-source="personList" class="scroll">
        <template #renderItem="{ item }">
          <a-list-item class="person-item" :class="{'color-3':selPersonId===item.id}" @click="personItemCli(item) ">{{ item.name }}</a-list-item>
        </template>
      </a-list>
    </div>
    <div class="person-content">
      <div class="edit-top">
        <div style="width: 4em"><a-input class="edit-input" size="small" v-model:value="editPerson.name" placeholder="姓名" spellcheck="false"></a-input></div>
        <div class="page-navi">
          <span class="cursor-default hoverActive" :class="{'active-blue':currPage ==='base'}" @click="currPage='base'"><AimOutlined/></span>
          <LineOutlined/>
          <span class="cursor-default hoverActive" :class="{'active-blue':currPage ==='likes'}" @click="currPage='likes'"><AimOutlined/></span>
          <LineOutlined/>
          <span class="cursor-default hoverActive" :class="{'active-blue':currPage ==='stories'}" @click="currPage='stories'"><AimOutlined/></span>
          <LineOutlined/>
          <span class="cursor-default hoverActive" :class="{'active-blue':currPage ==='result'}" @click="currPage='result'"><AimOutlined/></span>
        </div>
        <div>
          <HeartOutlined v-show="editPerson.uuid" class="hoverActive" @click="savePersonRel"/>
          <PlusCircleOutlined v-show="!editPerson.uuid"  class="hoverActive"  @click="savePersonRel"/>
          <!-- <a-button class="save-btn" size="small" @click="savePersonRel">{{ editPerson.uuid? '保存':'添加' }}</a-button> -->
        </div>
      </div>
      <div v-show="currPage==='base'" class="edit-content">
        <div class="edit-col">
          <!-- 性别 -->
          <div class="edit-item" style="width: 2em">
            <a-tooltip placement="right" trigger="click" :visible="genderSelTooltipShow" :overlayInnerStyle="{ fontSize: '0.8em', padding: '4px 8px' }">
              <template #title>
                <a-radio-group v-model:value="editPerson.gender" name="radioGroup">
                  <a-radio value="男" style="color: white;font-size: small" @click="genderSelTooltipShow = false">男</a-radio>
                  <a-radio value="女" style="color: white;font-size: small" @click="genderSelTooltipShow = false">女</a-radio>
                </a-radio-group>
              </template>
              <a-input class="edit-input" size="small" v-model:value="editPerson.gender" @blur="genderSelTooltipShow=false" @click="genderSelTooltipShow=true" placeholder="性别"></a-input>
            </a-tooltip>
          </div>
          <!-- 关系 -->
          <div class="edit-item" style="width: 3em">
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
          <div class="edit-item" style="width: 5.3em">
            <a-tooltip placement="right" trigger="click" :visible="birthSelTooltipShow" :overlayInnerStyle="{ padding: '4px 8px' }">
              <template #title>
                <span class="cursor-default" @wheel="wheelBirthTime($event, 0)">{{editBirth[0]}}</span>
                <span class="cursor-default" @wheel="wheelBirthTime($event, 1, [1,12])">{{`/${String(editBirth[1]).padStart(2, '0')}`}}</span>
                <span class="cursor-default" @wheel="wheelBirthTime($event, 2, [1,31])">{{`/${String(editBirth[2]).padStart(2, '0')}`}}</span>
              </template>
              <a-input class="edit-input" size="small" v-model:value="editPerson.birth_date" @blur="setBirthToEdit()" @click="birthInputCli" placeholder="生日"></a-input>
            </a-tooltip>
          </div>
        </div>
        <div class="edit-col">
          <!-- 年龄/类型/地址 -->
          <div class="edit-item" style="width: 2em"><a-input class="edit-input" size="small" :value="editAge" placeholder="年龄"></a-input></div>
          <div class="edit-item" style="width: 3em"><a-input class="edit-input" size="small" v-model:value="editPerson.mbti_type" placeholder="类型" ref="mbtiInput" @blur="mbtiInputBlur"></a-input></div>
          <div class="edit-item" style="width: 9em"><a-input class="edit-input" size="small" v-model:value="editPerson.location" placeholder="地址"></a-input></div>
        </div>
      </div>
      <!-- likes -->
      <div v-show="currPage==='likes'" class="edit-content">
        <div class="edit-col">
          <div class="edit-item">
            <a-textarea class="textarea-part" :rows="4" v-model:value="editPerson.likes" :bordered="false" placeholder="likes" />
          </div>

        </div>
        <div class="edit-col">
          <div class="edit-item">
            <a-textarea class="textarea-part" :rows="4" v-model:value="editPerson.dislikes" :bordered="false" placeholder="dislikes" />
          </div>
        </div>
      </div>
      <!-- stories -->
      <div v-show="currPage==='stories'" class="edit-content">
        <div class="edit-col">
          <div class="edit-item">
            <a-textarea class="textarea-part" :rows="4" v-model:value="editPerson.stories" :bordered="false" placeholder="stories" />
          </div>
        </div>
        <div class="edit-col">
          <div class="edit-item">
            <a-textarea class="textarea-part" :rows="4" v-model:value="editPerson.intersections" :bordered="false" placeholder="intersections" />
          </div>
        </div>
      </div>
      <!--  -->
      <div v-show="currPage==='result'" class="edit-content">
        <div class="edit-col">
          <div class="edit-item">
            <a-textarea class="textarea-part" :rows="4" v-model:value="editPerson.avoid" :bordered="false" placeholder="stories" />
          </div>
        </div>
        <div class="edit-col">
          <div class="edit-item">
            <a-textarea class="textarea-part" :rows="4" v-model:value="editPerson.active" :bordered="false" placeholder="intersections" />
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
import { CaretDownOutlined,AimOutlined,LineOutlined,HeartOutlined,PlusCircleOutlined } from '@ant-design/icons-vue'

// 数据
const selPersonId = ref(-1)
const currPage = ref('likes')
const mbtiInput = ref(null)
const genderSelTooltipShow = ref(false)
const birthSelTooltipShow = ref(false)
const relationExpandedKeys = ref([]);
const relationSelectedKeys = ref([]);
const relationshipSelTooltipShow = ref(false)
const editBirth = ref([1990,1,1])
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
  birth_date:'2025-01-02',
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
const relationshipVisible = ref(false)
let blurMbtiInput = false
// 方法:
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
  console.log(editPerson);
  await window.electron.savePersonRel({...editPerson})
  getPersonRelList()
}
const personItemCli = (item) => {
  selPersonId.value = item.id
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
  return Number(year) - Number(birthYear)
})
onBeforeUnmount(() => {
});

// 使用 ResizeObserver 来监听元素的尺寸变化
onMounted(() => {
  window.electron.resizeWindow([375,157])
  getPersonRelList()
})

</script>

<style scoped  lang="less">
.content-main {
  margin: 0 5px 5px 5px;
  display: flex;
}
.mbti-content {
  margin: 5px;
  padding: 5px;
  width: 20%;
  height: 100%;
  background-color: rgb(231, 244, 255);
  display: grid; //定义网格布局
  grid-template-columns: 1fr  1fr; 
  // minmax定义最小, 最大尺寸
  // fr: 平均分配剩余空间
  // 表示四列, 第一列最小100px, 第二列占2份空间
  gap: 5px; // 间距
  .mbti-item { // 子元素div
    background-color: rgb(183, 223, 255);
    border-radius: 10%;
    &:hover {
      background-color: rgb(137, 202, 255);
      cursor: default;
    }
  }
  .mbti-sel {
    background-color: rgb(137, 202, 255);
  }
}
.scroll {
  height: 118px;
  overflow: auto;
  background-color: rgb(255, 249, 242);
  &::-webkit-scrollbar {
    width: 0px;  /* 隐藏垂直滚动条 */
    height: 0px;  /* 隐藏水平滚动条 */
  }
}
.person-list {
  margin: 5px 0;
  height: 100%;
  background-color: rgb(255, 244, 228);
  .person-item {
    background-color: rgb(255, 235, 205);
    border-radius: 10%;
    padding: 3px;
    margin: 4px;
    cursor: default;
    &:hover {
      background-color: rgb(255, 226, 182);
    }
  }
}
.person-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 5px 5px;
  background-color: rgb(245, 236, 255);
  .edit-top {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    margin-top: 3px;
    margin: 3px;
  }
}
.page-navi {
  background-color: rgb(236, 219, 255);
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
  background-color: rgb(236, 219, 255);
  min-width: 2.5em;
  // max-width: 7em;
  border-radius: 10%;
  margin-left: 0;
  &:focus{
    outline: none;
    box-shadow: none;
  }
}
.edit-content {
  background-color: rgb(239, 233, 255);
  display: flex;
  .edit-col {
    margin: 5px;
    .edit-item {
      margin: 0 auto 3px 0;
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
.sel-item {
  background-color: rgb(255, 226, 182);
}
</style>
