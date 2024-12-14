document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('searchForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        fetchApiData(1);
    });
});

async function fetchApiData(page) {
    const selectedVocabularies = Array.from(document.querySelectorAll('#vocabularyOptions input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    const searchQuery = document.getElementById('searchQuery').value.trim();

    const vocabularyParams = selectedVocabularies.map(vocabulary => `vocabulary=${encodeURIComponent(vocabulary)}`).join('&');
    
    const pageSize = 15;
    const apiUrl = `https://athena.ohdsi.org/api/v1/concepts?pageSize=${pageSize}&page=${page}&${vocabularyParams}&query=${encodeURIComponent(searchQuery)}`;

    const displaySearchQuery = document.getElementById('displaySearchQuery');
    displaySearchQuery.innerHTML = `<p>Your query: ${searchQuery}</p>`;

    document.getElementById('loadingIndicator').style.display = 'block';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const apiDataDiv = document.getElementById('apiData');
        apiDataDiv.innerHTML = ''; // Clear previous results

        if (data.content && data.content.length > 0) {
            apiDataDiv.innerHTML += `<p>Page ${page} results:</p>`;
            displayResults(data.content.slice(0, 5), apiDataDiv);
        } else {
            apiDataDiv.innerHTML += '<p>No results found.</p>';
        }

        updatePagination(page, data.totalPages);
    } catch (error) {
        console.error('Failed to fetch API data:', error);
        apiDataDiv.innerHTML = '<p>Error loading data.</p>';
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function displayResults(results, container) {
    results.forEach(item => {
        const { code, name, vocabulary } = item;
        const content = `
            <div class="api-item">
                <p><strong>Code:</strong> ${code}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Vocabulary:</strong> ${vocabulary}</p>
            </div>
            <hr>
        `;
        container.innerHTML += content;
    });
}

function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear previous buttons
    const maxPagesToShow = 10; // Maximum number of pages to display at once
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage === totalPages && endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (currentPage > 1) {
        paginationContainer.appendChild(createPaginationButton(1, '<<'));
        paginationContainer.appendChild(createPaginationButton(currentPage - 1, '<'));
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPaginationButton(i, i.toString(), i === currentPage));
    }

    if (currentPage < totalPages) {
        paginationContainer.appendChild(createPaginationButton(currentPage + 1, '>'));
        paginationContainer.appendChild(createPaginationButton(totalPages, '>>'));
    }
}

function createPaginationButton(page, text, isActive = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('pagination-button');
    if (isActive) {
        button.classList.add('active');
    }
    button.addEventListener('click', function() {
        fetchApiData(page);
    });
    return button;
}

function deletecontent() {
    document.getElementById('searchQuery').value = '';
}