layui.use(['table'], function(){
  var table = layui.table;
  var book_id = location.href.split('/').pop();
  console.log(book_id);
  var tableInst = table.render({
    elem: '#section-list',
    url: '/admin/book/section/list/' + book_id,
    page: true,
    skin: 'line',
    cols: [[
      {type: 'checkbox'},
      {field: '_id', hide: 'true'},
      {field: 'book', title: '小说名称', templet: function(d) {
        return d.book.name
      }},
      {field: 'sectionNum', title: '章节数'},
      {field: 'title', title: '标题'},
      {field: 'content', hide: 'true'},
      {field: 'status', hide: 'true'},
      {title: '操作', toolbar: '#section-list-toolbar'}
    ]],
    parseData: function(res) {
      return {
        'code': res.status,
        'msg': res.msg,
        'count': res.count,
        'data': res.data
      }
    }
  });

});
