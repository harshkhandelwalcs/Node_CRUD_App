$(document).ready(function () {
    $('.delete-article').on('click', function (e) {
     
        const id = $(this).attr('data-id');
        $.ajax({
            type: 'DELETE',
            url: '/article/' + id,
            success: function (response) {
                alert('Deleting Article');
                window.location.href = '/';
            },
            error: function (err) {
                alert(err);
            }

        });
    });


});