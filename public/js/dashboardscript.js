$(document).ready(function() {
    const $searchInput = $('#search-input');
    const $searchCategory = $('#search-category');
    const $searchResults = $('#search-results');

    // Function to fetch search results for both friends and groups
    function fetchSearchResults() {
        const query = $searchInput.val().trim();
        const category = $searchCategory.val();
        const searchUrl = category === 'friends' ? '/user/search' : '/user/searchgroup';

        if (query.length > 2) {
            $searchResults.html('<p class="loading">Loading...</p>');

            fetch(`${searchUrl}?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    $searchResults.empty();

                    if (data.length) {
                        if (category === 'friends') {
                            // Display friend search results
                            data.forEach(user => {
                                const buttonClass = user.requestSent ? 'btn-warning' : 'btn-primary';
                                const buttonText = user.requestSent ? 'Cancel Request' : 'Send Request';
                                const mutualFriendsText = user.mutualFriendsCount ? `${user.mutualFriendsCount} Mutual Friends` : 'No Mutual Friends';

                                $searchResults.append(
                                    `<div class="list-group-item" data-user-id="${user._id}">
                                        ${user.username}
                                        <span class="mutual-friends">${mutualFriendsText}</span>
                                        <button class="btn ${buttonClass} btn-sm send-request-btn">${buttonText}</button>
                                    </div>`
                                );
                            });
                        } else {
                            // Display group search results
                            data.forEach(group => {
                                $searchResults.append(
                                    `<div class="list-group-item" data-group-id="${group._id}">
                                        ${group.name} - <span class="category">${group.category}</span>
                                    </div>`
                                );
                            });
                        }
                    } else {
                        $searchResults.html('<p class="no-data">No results found</p>');
                    }
                })
                .catch(() => {
                    $searchResults.html('<p class="no-data">Error retrieving results</p>');
                });
        } else {
            $searchResults.empty();
        }
    }

    // Function to load incoming friend requests
    function loadIncomingRequests() {
        const $requestsContainer = $('.requests-section .list-group');
        $requestsContainer.html('<p class="loading">Loading requests...</p>');

        fetch('/user/incomingrequests')
            .then(response => response.json())
            .then(data => {
                $requestsContainer.empty();

                if (data.length) {
                    data.forEach(request => {
                        $requestsContainer.append(
                            `<li class="list-group-item" data-request-id="${request._id}">
                                ${request.sender.username}
                                <button class="btn btn-success btn-sm accept-request-btn">Accept</button>
                                <button class="btn btn-danger btn-sm reject-request-btn">Reject</button>
                            </li>`
                        );
                    });
                } else {
                    $requestsContainer.html('<li class="list-group-item no-data">No pending requests</li>');
                }
            })
            .catch(() => {
                $requestsContainer.html('<li class="list-group-item no-data">Error loading requests</li>');
            });
    }

    // Function to load friends list
    function loadFriends() {
        const $friendsList = $('.friends-section .list-group');
        fetch('/user/friends')
            .then(response => response.json())
            .then(friends => {
                $friendsList.empty();

                if (friends.length > 0) {
                    friends.forEach(friend => {
                        $friendsList.append(`<li class="list-group-item">${friend.username}</li>`);
                    });
                } else {
                    $friendsList.append('<li class="list-group-item no-data">No friends yet</li>');
                }
            })
            .catch(() => {
                $friendsList.html('<li class="list-group-item no-data">Error loading friends</li>');
            });
    }

    // Accept friend request
    $(document).on('click', '.accept-request-btn', function() {
        const button = $(this);
        const requestId = button.closest('.list-group-item').data('request-id');

        button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Accepting...');

        fetch('/user/acceptrequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId })
        })
        .then(response => {
            if (response.ok) {
                loadIncomingRequests();
                loadFriends();
            } else {
                throw new Error('Failed to accept request');
            }
        })
        .catch(() => {
            alert('Error accepting the request');
        })
        .finally(() => {
            button.prop('disabled', false).text('Accept');
        });
    });

    // Reject friend request
    $(document).on('click', '.reject-request-btn', function() {
        const button = $(this);
        const requestId = button.closest('.list-group-item').data('request-id');

        button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Rejecting...');

        fetch('/user/rejectrequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId })
        })
        .then(response => {
            if (response.ok) {
                loadIncomingRequests();
            } else {
                throw new Error('Failed to reject request');
            }
        })
        .catch(() => {
            alert('Error rejecting the request');
        })
        .finally(() => {
            button.prop('disabled', false).text('Reject');
        });
    });

    // Send/cancel friend request
    $(document).on('click', '.send-request-btn', function() {
        const button = $(this);
        const userId = button.closest('.list-group-item').data('user-id');
        const isCancelRequest = button.text() === 'Cancel Request';

        button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

        fetch(isCancelRequest ? '/user/cancelrequest' : '/user/sendrequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId: userId })
        })
        .then(response => {
            if (response.ok) {
                button.text(isCancelRequest ? 'Send Request' : 'Cancel Request')
                      .toggleClass('btn-primary btn-warning');
            } else {
                throw new Error('Failed to process request');
            }
        })
        .catch(() => {
            alert('Error processing the request');
        })
        .finally(() => {
            button.prop('disabled', false);
        });
    });

    // Event listener for search input changes
    $searchInput.on('input', fetchSearchResults);

    // Initial data loading
    loadIncomingRequests();
    loadFriends();
});
