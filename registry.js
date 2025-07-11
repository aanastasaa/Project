<script>
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Отменяем стандартную отправку формы
    
    const searchQuery = document.getElementById('searchInput').value.trim();
    
    if (searchQuery) {
        // Здесь реализуйте логику поиска
        performSearch(searchQuery);
    }
});

function filterOrganizations(query) {
    const orgs = document.querySelectorAll('.organization');
    const lowerQuery = query.toLowerCase();
    
    orgs.forEach(org => {
        const name = org.querySelector('.org-name').textContent.toLowerCase();
        org.style.display = name.includes(lowerQuery) ? '' : 'none';
    });
}
</script>