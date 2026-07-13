<template>
  <div class="widget" style="background: var(--bg-card); border-radius: var(--border-radius); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column;">
    <div class="widget-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1rem; color: var(--text-dark); margin: 0; font-weight: 600;"><i :class="icon" style="color: var(--primary-color); margin-right: 0.5rem;"></i> {{ title }}</h3>
    </div>
    <div class="widget-body" style="position: relative; height: 320px; width: 100%; padding: 20px;">
      <canvas ref="canvasRef"></canvas>
    </div>
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
  
  const isDoughnut = props.chartType === 'doughnut'
  chartInstance.value = new Chart(canvasRef.value, {
    type: props.chartType,
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: isDoughnut ? '75%' : undefined,
      elements: {
        arc: {
          borderWidth: isDoughnut ? 0 : 2,
          borderRadius: isDoughnut ? 4 : 0
        }
      },
      plugins: {
        legend: { 
          display: !isDoughnut, // Hide legend for doughnut to avoid clutter
          position: 'bottom',
          labels: { color: '#a0aec0', font: { family: "'Inter', sans-serif" } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: "'Inter', sans-serif", size: 13 },
          bodyFont: { family: "'Inter', sans-serif", size: 13 },
          padding: 12,
          cornerRadius: 8,
          boxPadding: 6
        }
      },
      scales: isDoughnut ? {} : {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0aec0' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0aec0' } }
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
