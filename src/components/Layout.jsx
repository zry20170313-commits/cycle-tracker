import { NavLink } from 'react-router-dom';
import { Home, Calendar, PlusCircle, BarChart3, Settings, Heart } from 'lucide-react';

export default function Layout({ userInfo, children }) {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <Heart className="header-icon" />
          <h1>周期伴侣</h1>
        </div>
        {userInfo && (
          <div className="header-user">
            <span>你好，{userInfo.name || '用户'}</span>
          </div>
        )}
      </header>
      
      <main className="app-main">
        <Outlet />
      </main>
      
      <nav className="app-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Home size={22} />
          <span>首页</span>
        </NavLink>
        <NavLink to="/cycle" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={22} />
          <span>周期</span>
        </NavLink>
        <NavLink to="/daily" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <PlusCircle size={22} />
          <span>记录</span>
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BarChart3 size={22} />
          <span>数据</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Settings size={22} />
          <span>设置</span>
        </NavLink>
      </nav>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
