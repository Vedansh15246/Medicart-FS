import { MdAccountCircle } from "react-icons/md";
import { Link, Outlet } from "react-router-dom";

const ClientDashboard = () => {
    return (
        <div className="w-100 d-flex vh-100 bg-body-secondary">
            <div className="col-3 rounded-end-4 bg-body-tertiary shadow-sm border d-flex flex-column">
                <div className="border-bottom py-2 px-3">
                    <Link to={"/"}>
                        <div className="brand py-1" style={{ width: "fit-content" }}>
                            <div className="brand-text">
                                <span className="brand-main">Medi</span>{" "}
                                <span className="brand-accent">Cart</span>
                               
                            </div>
                            <div className="brand-underline" />
                        </div>
                    </Link>
                </div>

                <div>
                    <ul className="list-unstyled">
                        <li className="border m-3 rounded-3 shadow-sm sidebar-list">
                            <Link className="p-2 text-decoration-none text-secondary fw-semibold d-block" to="/dashboard_client/prescription">
                                Prescription
                            </Link>
                        </li>
                    
                        
                    </ul>
                </div>

                <div className="mt-auto">
                    <div className="border m-3 rounded-3 sidebar-list">
                        <Link to="/dashboard_client/account" className="p-2 d-flex align-items-center gap-2 text-decoration-none">
                            <MdAccountCircle className="fs-4 text-primary" />
                            <span className="fw-bold text-secondary">Account </span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="col-9 px-3 py-2">
                <Outlet />
            </div>
        </div>
    )
}

export default ClientDashboard