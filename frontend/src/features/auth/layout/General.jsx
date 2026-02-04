import { Outlet } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import { setSearchQuery } from "../../catalog/productSlice";
import { useDispatch, useSelector } from "react-redux";
import '../../catalog/home.css'

const General = () => {
  const dispatch = useDispatch();
  const { q } = useSelector(
    (state) => state.products.search
  );

  return (
    <div className="page">
      <Navbar
        searchValue={q}
        onSearch={(val) => dispatch(setSearchQuery(val))}
      />
      <Outlet />
    </div>
  );
};

export default General;