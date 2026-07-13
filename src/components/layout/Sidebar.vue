<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-placeholder">
        <i class="fa-solid fa-file-signature"></i>
      </div>
      <div class="app-title">
        <h2>E-Kontrak</h2>
        <p>PPPK MANAGER</p>
      </div>
    </div>
    
    <nav class="sidebar-menu">
      <router-link to="/" class="menu-item">
        <i class="fa-solid fa-chart-pie"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/data-pegawai" class="menu-item">
        <i class="fa-solid fa-users"></i>
        <span>Data PPPK</span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer">
      <div class="theme-toggle">
        <i class="fa-solid fa-sun"></i>
        <label class="switch">
          <input type="checkbox" id="theme-switch" />
          <span class="slider round"></span>
        </label>
        <i class="fa-solid fa-moon"></i>
      </div>
      <router-link to="/settings" class="user-profile menu-item">
        <div class="avatar">ADM</div>
        <div class="user-info">
          <h4>Administrator</h4>
          <p>Kepegawaian</p>
        </div>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
</script>

<style scoped>
/* Inherits from styles.css */
</style>
