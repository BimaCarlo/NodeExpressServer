$(function(){
 
});
//---------------------------------------------------------------------------
function request_JSON(){
    $.ajax({
        type:'GET',
        url:'JSON/' + $("#file").val() +'.json',
        contentType:'json',
        data:{},})
            .done(function(data){
                console.log('SUCCESS');
                console.log(JSON.stringify(data));
                DataTable(data);
            })
            .fail(function(msg){console.log(msg + ': FAIL');})
            .always(function(msg){console.log(msg + ': ALWAYS');});
}
//---------------------------------------------------------------------------
function DataTable(data_json){
    console.log(JSON.stringify(data_json));
    //---------------------------------------------------------------------------
    $("#data").empty();
    $("#data").append("<table id='table'></table>");
    let table = $("#table").attr('class','display nowrap dataTable dtr-inline collapsed grid');
    if ($.fn.dataTable.isDataTable(table))
        table.DataTable({destroy: true, searching: false}).destroy();
    //---------------------------------------------------------------------------
    let cols = [];
    console.log(data_json[0]);
    for (let key in data_json[0])
        if (key.indexOf("id") === -1) cols.push({"title":key,"data":key});
    console.log(JSON.stringify(cols));
    //---------------------------------------------------------------------------
    table.empty();
    //---------------------------------------------------------------------------
    if (cols.length>0)
        table.DataTable({"data": data_json, "columns": cols});
}