<script setup>
import {Icon, MenuItem, Space, Message} from "view-ui-plus";
import {inject, onBeforeMount, onMounted, ref} from "vue";
import {fetchJson} from "@/components/electronAPI.js";
const targetEnvChoices = ref();
const targetAccountChoices = ref();
const targetEnv = inject("targetEnv");
const targetAccount = inject("targetAccount");
const defaultTargetEnv = ref();
const defaultTargetAccount = ref();
const env = inject("env");

const fetchTargetData = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 加载系统配置
    env.value =  await window.electron.fetchData("json", {"filename": "env.json5"});
    console.log(env.value);
    // 加载右上角外系统环境
    targetEnvChoices.value = await fetchJson("targetEnv.json5");
    targetEnv.value = targetEnvChoices.value[0];
    defaultTargetEnv.value = targetEnv.value.value;
    // 加载右上角账号
    const response = await window.electron.fetchData("json", {"filename": "targetAccount.json5"});
    targetAccountChoices.value = response.users;
    targetAccount.value = targetAccountChoices.value[0];
    defaultTargetAccount.value = targetAccount.value.value;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
onBeforeMount(fetchTargetData);

function targetEnvOnSelect(model) {
  for (let i = 0; i < targetEnvChoices.value.length; i++) {
    if (targetEnvChoices.value[i].value === model.value) {
      targetEnv.value = targetEnvChoices.value[i];
    }
  }
}

function targetAccountOnSelect(model) {
  for (let i = 0; i < targetAccountChoices.value.length; i++) {
    if (targetAccountChoices.value[i].value === model.value) {
      targetAccount.value = targetAccountChoices.value[i];
    }
  }
}

</script>
<template>
  <Menu theme="light" active-name="1" mode="horizontal" class="fixed-menu">
    <div class="menu-left">
      <MenuItem name="1">
        <RouterLink class="custom-link" to="/">
        <Icon type="ios-paper"/>
        服务状态
        </RouterLink>
      </MenuItem>
      <MenuItem name="2">
        <RouterLink class="custom-link" to="/flow">
        <Icon type="ios-git-merge" />
        调用流
        </RouterLink>
      </MenuItem>
    </div>
    <div class="menu-right">
      <Space>
        <Select v-model="defaultTargetEnv" @on-select="targetEnvOnSelect" :style="env.frontend.targetEnvStyle" prefix="md-code-working" filterable>
          <Option v-for="env in targetEnvChoices" :value="env.value" :label="env.label">
            <span>{{ env.label }}</span>
            <span style="float:right;color:#ccc">{{ env.value }}</span>
          </Option>
        </Select>
        <Select v-model="defaultTargetAccount" @on-select="targetAccountOnSelect" :style="env.frontend.accountStyle" filterable>
          <Option v-for="account in targetAccountChoices" :value="account.value" :label="account.label" >
            <span>{{ account.label }}</span>
          </Option>
        </Select>
      </Space>
    </div>
  </Menu>
  <br>
</template>

<style scoped>
.menu-right {
  width: 300px;
  margin: 0 20px 0 auto;
}

.custom-link {
  color: inherit; /* 继承父元素的颜色 */
  text-decoration: none; /* 去掉下划线 */
  display: block;
  width: 100%;
  height: 100%;
}

.custom-link:hover, .custom-link:focus, .custom-link:active {
  color: inherit; /* 继承父元素的颜色 */
  text-decoration: none; /* 去掉下划线 */
}
.fixed-menu {
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* 确保菜单在其他元素之上 */
}
</style>