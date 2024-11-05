import {render, screen} from "@testing-library/react";
import AddressForm from "../components/Address/AddressForm";

test('address field', ()=>{
    render(<AddressForm/>);
    let checkInput = screen.getByRole("City");
    expect(checkInput).toBeInTheDocument()
})