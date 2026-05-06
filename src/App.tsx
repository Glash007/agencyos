import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "./supabaseClient";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now = new Date();
const thisMonth = now.getMonth();
const thisYear = now.getFullYear();
function fmt(n: number){return "\u20b1"+Number(n).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});}
function uid(){return Math.random().toString(36).slice(2,8);}

const css=`*{box-sizing:border-box;margin:0;padding:0;}:root{--bg:#0f1117;--surface:#181c27;--surface2:#1e2336;--border:#ffffff12;--border2:#ffffff20;--text:#f0f2ff;--muted:#7b82a0;--green:#22c97a;--green-dim:#0d4a2c;--red:#ff5c5c;--blue:#4e8cff;--blue-dim:#0d2456;--purple:#a374ff;--amber:#ffb547;--r-sm:8px;--r-md:12px;--r-lg:16px;}body{background:var(--bg);color:var(--text);font-family:system-ui,sans-serif;font-size:14px;}.app{max-width:720px;margin:0 auto;padding:1.5rem 1rem 3rem;}.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;}.logo{font-size:18px;font-weight:700;background:linear-gradient(135deg,#a374ff,#4e8cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.tagline{font-size:11px;color:var(--muted);margin-top:2px;}.nav{display:flex;gap:6px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:5px;margin-bottom:1.75rem;overflow-x:auto;}.nav-btn{flex:1;min-width:80px;padding:8px 10px;border:none;border-radius:var(--r-md);background:transparent;color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;}.nav-btn.active{background:var(--surface2);color:var(--text);}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:1.25rem;}.stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1rem 1.1rem;position:relative;overflow:hidden;}.stat::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;border-radius:var(--r-lg) var(--r-lg) 0 0;}.stat.green::before{background:var(--green);}.stat.red::before{background:var(--red);}.stat.blue::before{background:var(--blue);}.stat.purple::before{background:var(--purple);}.stat.amber::before{background:var(--amber);}.stat-label{font-size:11px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;}.stat-value{font-size:22px;font-weight:700;}.stat-value.green{color:var(--green);}.stat-value.red{color:var(--red);}.stat-value.blue{color:var(--blue);}.stat-value.purple{color:var(--purple);}.stat-value.amber{color:var(--amber);}.chart-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.25rem;}.card-title{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;margin-bottom:1rem;}.legend{display:flex;gap:14px;margin-top:12px;}.leg{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);}.leg-dot{width:9px;height:9px;border-radius:2px;}.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;gap:8px;flex-wrap:wrap;}.filter-group{display:flex;gap:4px;}.filter-btn{padding:6px 14px;font-size:12px;border-radius:20px;border:1px solid var(--border2);background:transparent;color:var(--muted);cursor:pointer;font-weight:500;}.filter-btn.active{background:var(--blue-dim);border-color:var(--blue);color:var(--blue);}.btn-add{padding:7px 16px;font-size:13px;border-radius:var(--r-md);border:1px solid var(--blue);background:var(--blue-dim);color:var(--blue);cursor:pointer;font-weight:600;}.form-card{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r-lg);padding:1.1rem;margin-bottom:1rem;}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}.form-grid .full{grid-column:1/-1;}input,select{width:100%;padding:9px 12px;background:#0f1117;border:1px solid var(--border2);border-radius:var(--r-sm);color:var(--text);font-size:13px;outline:none;}input:focus,select:focus{border-color:var(--blue);}select option{background:#1e2336;}.btn-save{padding:8px 20px;font-size:13px;border-radius:var(--r-md);border:none;background:linear-gradient(135deg,#a374ff,#4e8cff);color:#fff;cursor:pointer;font-weight:600;}.tx-list{border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;}.tx-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--surface);}.tx-row:last-child{border-bottom:none;}.tx-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}.tx-dot.income{background:var(--green);}.tx-dot.expense{background:var(--red);}.tx-info{flex:1;min-width:0;}.tx-desc{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.tx-meta{font-size:11px;color:var(--muted);margin-top:2px;}.tx-amt{font-weight:700;font-size:14px;flex-shrink:0;}.tx-amt.income{color:var(--green);}.tx-amt.expense{color:var(--red);}.del-btn{background:none;border:none;cursor:pointer;color:var(--muted);font-size:18px;line-height:1;padding:0 2px;}.del-btn:hover{color:var(--red);}.client-grid{display:flex;flex-direction:column;gap:10px;}.client-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.1rem 1.25rem;}.client-header{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;}.client-name{font-size:15px;font-weight:700;}.client-project{font-size:12px;color:var(--muted);margin-top:3px;}.client-contact{font-size:11px;color:var(--muted);margin-top:3px;}.status-badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;flex-shrink:0;}.status-badge.Active{background:#0d4a2c;color:var(--green);}.status-badge.Completed{background:#0d2456;color:var(--blue);}.status-badge.Inactive{background:#2a2a3a;color:var(--muted);}.client-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);}.client-billed{font-size:17px;font-weight:700;color:var(--green);}.client-billed-label{font-size:11px;color:var(--muted);}.emp-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.1rem 1.25rem;margin-bottom:10px;}.emp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}.emp-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#a374ff44,#4e8cff44);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--purple);flex-shrink:0;}.emp-name{font-size:14px;font-weight:700;margin-bottom:2px;}.emp-role{font-size:12px;color:var(--muted);}.pay-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;}.pay-cell{background:var(--surface2);border-radius:var(--r-sm);padding:8px 10px;}.pay-label{font-size:10px;color:var(--muted);text-transform:uppercase;margin-bottom:4px;}.pay-val{font-size:14px;font-weight:700;}.pay-val.purple{color:var(--purple);}.pay-val.blue{color:var(--blue);}.paid-btn{padding:6px 16px;font-size:12px;font-weight:600;border-radius:20px;cursor:pointer;}.paid-btn.unpaid{background:transparent;border:1px solid var(--border2);color:var(--muted);}.paid-btn.paid{background:var(--green-dim);border:1px solid var(--green);color:var(--green);}.empty{text-align:center;padding:2rem;color:var(--muted);font-size:13px;}`;

export default function App(){
    const [tab,setTab]=useState(0);
    const [txs,setTxs]=useState<any[]>([]);
    const [clients,setClients]=useState<any[]>([]);
    const [emps,setEmps]=useState<any[]>([]);
    const [loading,setLoading]=useState(true);
    const [txForm,setTxForm]=useState({type:"income",category:"Client Payment",desc:"",amount:"",date:new Date().toISOString().slice(0,10)});
    const [cForm,setCForm]=useState({name:"",project:"",status:"Active",billed:"",contact:""});
    const [eForm,setEForm]=useState({name:"",role:"",salary:"",schedule:"monthly",startDate:"",payoutDate:"",workDays:5});
    const [showTx,setShowTx]=useState(false);
    const [showC,setShowC]=useState(false);
    const [showE,setShowE]=useState(false);
    const [txFilter,setTxFilter]=useState("all");
    const [dedForm,setDedForm]=useState<any>({});
    const [showDed,setShowDed]=useState<any>({});

  useEffect(()=>{
        async function load(){
                setLoading(true);
                const [{data:td},{data:cd},{data:ed},{data:dd}]=await Promise.all([
                          supabase.from("transactions").select("*").order("date",{ascending:false}),
                          supabase.from("clients").select("*").order("created_at",{ascending:false}),
                          supabase.from("employees").select("*").order("created_at",{ascending:false}),
                          supabase.from("employee_deductions").select("*"),
                        ]);
                setTxs((td||[]).map((t:any)=>({id:t.id,type:t.type,category:t.category,desc:t.description,amount:Number(t.amount),date:t.date})));
                setClients(cd||[]);
                setEmps((ed||[]).map((e:any)=>({id:e.id,name:e.name,role:e.role||"",salary:Number(e.salary),schedule:e.schedule,paid:e.paid,startDate:e.start_date||"",payoutDate:e.payout_date||"",workDays:e.work_days,deductions:(dd||[]).filter((d:any)=>d.employee_id===e.id).map((d:any)=>({id:d.id,reason:d.reason,days:Number(d.days),amount:Number(d.amount)}))})));
                setLoading(false);
        }
        load();
  },[]);

  const totalIncome=useMemo(()=>txs.filter(t=>t.type==="income").reduce((s:number,t:any)=>s+t.amount,0),[txs]);
    const totalExpense=useMemo(()=>txs.filter(t=>t.type==="expense").reduce((s:number,t:any)=>s+t.amount,0),[txs]);
    const netProfit=totalIncome-totalExpense;
    const totalBilled=useMemo(()=>clients.reduce((s:number,c:any)=>s+Number(c.billed),0),[clients]);
    const totalPayroll=useMemo(()=>emps.reduce((s:number,e:any)=>s+e.salary,0),[emps]);
    const monthlyData=useMemo(()=>{
          const map:any={};
          for(let i=4;i>=0;i--){const d=new Date(thisYear,thisMonth-i,1);const k=MONTHS[d.getMonth()];map[k]={month:k,income:0,expense:0};}
          txs.forEach(t=>{const k=MONTHS[new Date(t.date).getMonth()];if(map[k])map[k][t.type]+=t.amount;});
          return Object.values(map);
    },[txs]);
    const filteredTxs=txFilter==="all"?txs:txs.filter(t=>t.type===txFilter);
    const initials=(n:string)=>n.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase();

  async function addTx(){if(!txForm.desc||!txForm.amount)return;const row={id:uid(),type:txForm.type,category:txForm.category,description:txForm.desc,amount:Number(txForm.amount),date:txForm.date};const{error}=await supabase.from("transactions").insert(row);if(!error){setTxs(p=>[{...row,desc:row.description},...p]);setTxForm({type:"income",category:"Client Payment",desc:"",amount:"",date:new Date().toISOString().slice(0,10)});setShowTx(false);}}
    async function delTx(id:string){await supabase.from("transactions").delete().eq("id",id);setTxs(p=>p.filter((x:any)=>x.id!==id));}
    async function addC(){if(!cForm.name||!cForm.project)return;const row={id:uid(),name:cForm.name,project:cForm.project,status:cForm.status,billed:Number(cForm.billed||0),contact:cForm.contact};const{error}=await supabase.from("clients").insert(row);if(!error){setClients(p=>[row,...p]);setCForm({name:"",project:"",status:"Active",billed:"",contact:""});setShowC(false);}}
    async function delClient(id:string){await supabase.from("clients").delete().eq("id",id);setClients(p=>p.filter((x:any)=>x.id!==id));}
    async function addE(){if(!eForm.name||!eForm.salary)return;const row={id:uid(),name:eForm.name,role:eForm.role,salary:Number(eForm.salary),schedule:eForm.schedule,paid:false,start_date:eForm.startDate||null,payout_date:eForm.payoutDate||null,work_days:Number(eForm.workDays)||5};const{error}=await supabase.from("employees").insert(row);if(!error){setEmps(p=>[{...row,
