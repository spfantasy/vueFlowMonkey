<script setup>
import { computed } from 'vue'
import {Handle, Position, useHandleConnections, useNodesData, useVueFlow} from '@vue-flow/core'
import {Icon, Message, Select, Space} from 'view-ui-plus';
import JSON5 from "json5";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['render-component']);

function renderComponent() {
  emit("render-component", props.data.component);
}
</script>

<template>
  <div @click="renderComponent">
    <span class="line" style="color: #ea15b1">
      {{props.data.label}}
    </span>
    <span class="line" v-if="props.data.abstract != null">
      {{props.data.abstract}}
    </span>
  </div>
  <Handle type="source" :position="Position.Bottom" :connectable="false" />
  <Handle type="target" :position="Position.Top" :connectable="false" />
</template>
<style scoped>
.line {
  display: block;
}
</style>