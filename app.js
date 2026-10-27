const isEnglish=document.documentElement.lang==='en';
const assetBase=isEnglish?'../':'';
let products=[],page=Math.max(1,Math.trunc(Number(new URLSearchParams(location.search).get('page'))||1));
const pageSize=2,grid=document.querySelector('#product-grid');
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageLabel=label=>isEnglish?({'車型型錄':'Vehicle Catalog','配件型錄':'Parts Catalog'}[label]||label):label;
function render(){
 if(!grid)return;
 const matches=products.filter(p=>p.cat==='車型應用');
 const totalPages=Math.max(1,Math.ceil(matches.length/pageSize));page=Math.min(Math.max(1,page),totalPages);
 const start=(page-1)*pageSize,visible=matches.slice(start,start+pageSize);
 grid.innerHTML=visible.map(p=>{
  const spec=isEnglish?(p.images.length>1?'Vehicle & Parts Catalog · '+p.images.length+' pages':'Vehicle Application Catalog'):p.spec;
  const count=isEnglish?p.images.length+' pages':p.images.length+'張';
  const view=isEnglish?'View ':'查看';
  return '<article class="product"><a class="product-image '+(p.images.length>1?'paired':'')+'" href="'+p.url+'" aria-label="'+view+escapeHtml(p.name)+'">'+p.images.map(im=>'<img src="'+assetBase+im.src+'" alt="'+escapeHtml(p.name)+' '+escapeHtml(imageLabel(im.label))+'" loading="lazy" decoding="async">').join('')+(p.images.length>1?'<span class="image-count">'+count+'</span>':'')+'<span>→</span></a><h3>'+escapeHtml(p.name)+'</h3><p>'+escapeHtml(spec)+'</p></article>';
 }).join('');
 document.querySelector('#catalog-result').textContent=isEnglish?
  matches.length+' models · Up to '+pageSize+' models per page | Page '+page+' of '+totalPages:
  '共 '+matches.length+' 個車型，每頁最多'+pageSize+'種｜第 '+page+' / '+totalPages+' 頁';
 const pager=document.querySelector('.catalog-pagination');pager.hidden=totalPages<=1;
 const previous=isEnglish?'← Previous':'← 上一頁',next=isEnglish?'Next →':'下一頁 →';
 pager.innerHTML=totalPages>1?'<button data-page="'+(page-1)+'" '+(page===1?'disabled':'')+' aria-label="'+(isEnglish?'Previous page':'上一頁車型')+'">'+previous+'</button><div class="page-numbers">'+Array.from({length:totalPages},(_,i)=>'<button data-page="'+(i+1)+'" '+(page===i+1?'aria-current="page"':'')+' aria-label="'+(isEnglish?'Page '+(i+1):'第 '+(i+1)+' 頁')+'">'+(i+1)+'</button>').join('')+'</div><button data-page="'+(page+1)+'" '+(page===totalPages?'disabled':'')+' aria-label="'+(isEnglish?'Next page':'下一頁車型')+'">'+next+'</button>':'';
}
document.querySelector('.catalog-pagination')?.addEventListener('click',e=>{
 const button=e.target.closest('[data-page]');if(!button||button.disabled)return;
 page=Number(button.dataset.page);render();
 const url=new URL(location.href);if(page===1)url.searchParams.delete('page');else url.searchParams.set('page',page);
 history.replaceState(null,'',url);dispatchEvent(new Event('catalogpagechange'));
});
function renderFilters(){document.querySelector('#vehicle-filters').innerHTML=products.filter(p=>p.cat==='車型應用').map(p=>'<a href="'+p.url+'">'+escapeHtml(p.name)+'</a>').join('');}
fetch(assetBase+'products.json?v=bilingual').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{products=data;renderFilters();render()}).catch(()=>{if(grid)grid.innerHTML='<p class="empty">'+(isEnglish?'The catalog could not be loaded. Please refresh the page.':'型錄暫時無法載入，請重新整理頁面。')+'</p>';});

