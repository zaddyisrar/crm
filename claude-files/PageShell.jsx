import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function PageShell({ children, title, subtitle }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Topbar title={title} subtitle={subtitle} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
