const fs = require('fs');
let c = fs.readFileSync('src/views/RiwayatView.vue', 'utf8');

c = c.replace('<tr v-else-if=\"filteredHistory.length === 0\">', '<tr v-else-if=\"paginatedHistory.length === 0\">');
c = c.replace('<tr v-else v-for=\"(history, index) in filteredHistory\"', '<tr v-else v-for=\"(history, index) in paginatedHistory\"');

c = c.replace('</table>\\n        </div>\\n      </div>', '</table>\\n        </div>\\n        <div class=\"pagination\" style=\"display: flex; gap: 15px; align-items: center; justify-content: flex-end; padding-top: 15px; padding-right: 15px;\">\\n          <button class=\"btn btn-outline btn-sm\" :disabled=\"currentPage === 1\" @click=\"currentPage--\"><i class=\"fa-solid fa-chevron-left\"></i> Sebelumnya</button>\\n          <span class=\"page-info text-muted\">Halaman {{ currentPage }} dari {{ totalPages }}</span>\\n          <button class=\"btn btn-outline btn-sm\" :disabled=\"currentPage === totalPages || totalPages === 0\" @click=\"currentPage++\">Selanjutnya <i class=\"fa-solid fa-chevron-right\"></i></button>\\n        </div>\\n      </div>');

c = c.replace('const filteredHistory = computed(() => {', 'const currentPage = ref(1)\\nconst itemsPerPage = ref(10)\\n\\nconst filteredHistory = computed(() => {');

c = c.replace(/\\/\\/ Hapus pilihan jika filter diubah[\\s\\S]*?watch\\(filterTmtBaru, \\(\\) => \\{[\\s\\S]*?selectedItems\\.value = \\[\\][\\s\\S]*?\\}\\)/, '// Hapus pilihan jika filter diubah\\n  watch([searchQuery, filterTmtBaru], () => {\\n    currentPage.value = 1\\n    selectedItems.value = []\\n  })\\n\\n  const totalPages = computed(() => Math.ceil(filteredHistory.value.length / itemsPerPage.value))\\n\\n  const paginatedHistory = computed(() => {\\n    const start = (currentPage.value - 1) * itemsPerPage.value\\n    const end = start + Number(itemsPerPage.value)\\n    return filteredHistory.value.slice(start, end)\\n  })');

c = c.replace('return filteredHistory.value.length > 0 && selectedItems.value.length === filteredHistory.value.length', 'return paginatedHistory.value.length > 0 && paginatedHistory.value.every(item => selectedItems.value.includes(item))');
c = c.replace('selectedItems.value = [...filteredHistory.value]', 'const newSelection = [...selectedItems.value]\\n      paginatedHistory.value.forEach(item => {\\n        if (!newSelection.includes(item)) newSelection.push(item)\\n      })\\n      selectedItems.value = newSelection');
c = c.replace('} else {\\n        selectedItems.value = []\\n      }', '} else {\\n        selectedItems.value = selectedItems.value.filter(item => !paginatedHistory.value.includes(item))\\n      }');

fs.writeFileSync('src/views/RiwayatView.vue', c);
