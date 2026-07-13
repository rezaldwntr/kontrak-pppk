<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3><i :class="icon"></i> {{ title }}</h3>
    </div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, shallowRef } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  title: String,
  icon: String,
  chartData: Object,
  chartType: { type: String, default: 'pie' }
})

const canvasRef = ref(null)
const chartInstance = shallowRef(null)

const renderChart = () => {
  if (!canvasRef.value) return
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  
  chartInstance.value = new Chart(canvasRef.value, {
    type: props.chartType,
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  })
}

onMounted(() => {
  renderChart()
})

watch(() => props.chartData, () => {
  renderChart()
}, { deep: true })
</script>

<style scoped>
/* chart-container is usually defined in styles.css */
</style>
