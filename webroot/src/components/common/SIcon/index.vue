<template>
  <svg :class="[svgClass, disabled ? '' : '']"  aria-hidden="true">
    <use :href="symbolId" />
  </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
export default defineComponent({
  name: "s-icon",
  props: {
    name: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean
    }
  },
  setup(props) {
    const symbolId = computed(() => `#icon-${props.name}`);
    const svgClass = computed(() => {
      if (props.name) {
        return `s-icon s-icon-${props.name}`;
      }
      return "s-icon";
    });
    return { symbolId, svgClass };
  },
});
</script>
<style lang="less" scoped>

.disabled {
  pointer-events: none;
  cursor: not-allowed;
  filter: grayscale(0.7) opacity(0.5);
  &:hover {
    cursor: not-allowed;
  }
}
.s-icon {
  width: 1.2em;
  height: 1.2em;
  vertical-align: -0.2em;
  fill: currentColor;
  overflow: hidden;
  margin: 0 0.5em;
}
</style>
