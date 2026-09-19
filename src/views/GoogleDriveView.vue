<template>
  <div>
    <div class="page-header" style="margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 10px;">
        <i class="fa-brands fa-google-drive" style="color: #1eaa6e;"></i>
        Google Drive Sync
      </h2>
      <p style="margin: 4px 0 0 0; color: var(--text-muted); font-size: 0.9rem;">
        Integrasi penyimpanan cloud dan sinkronisasi otomatis dokumen perjanjian kerja PPPK
      </p>
    </div>

    <DriveSyncTab />
  </div>
</template>

<script setup>
import DriveSyncTab from '../components/settings/DriveSyncTab.vue'
</script>
