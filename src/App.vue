<script setup>
import Navigator from "./components/Navigator.vue";
import {RouterView} from "vue-router";
import {provide, ref} from "vue";
import {Message} from "view-ui-plus";
const env = ref({"frontend": {}, "backend": {}});
const targetEnv = ref({});
const targetAccount = ref({});
provide("env", env);
provide("targetEnv", targetEnv);
provide("targetAccount", targetAccount);
Message.config({duration: 5});
</script>

<template>
  <Navigator/>
  <RouterView/>
</template>
<style>
html, body, #app {
  margin: 0;
  height: 100%;
}

#app {
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>