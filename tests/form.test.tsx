// @vitest-environment jsdom
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,screen,cleanup,fireEvent} from '@testing-library/react';
import AddressForm from '../src/AddressForm';
import {geography} from '../shared/address';
afterEach(cleanup);
it('blocks submission until all fields and a valid mobile are present, then resets children',()=>{
 render(<AddressForm canSubmit={true} onSubmit={vi.fn(async()=>{})}/>);
 const button=screen.getByRole('button') as HTMLButtonElement;expect(button.disabled).toBe(true);
 const r=geography.find(r=>r.provinceCode==='10')!;
 fireEvent.change(screen.getByLabelText('ชื่อ-นามสกุล'),{target:{value:'ผู้ทดสอบ'}});fireEvent.change(screen.getByLabelText('ที่อยู่'),{target:{value:'99'}});
 fireEvent.change(screen.getByLabelText('จังหวัด'),{target:{value:r.provinceCode}});fireEvent.change(screen.getByLabelText('เขต'),{target:{value:r.districtCode}});fireEvent.change(screen.getByLabelText('แขวง'),{target:{value:r.subdistrictCode}});
 expect((screen.getByLabelText('รหัสไปรษณีย์') as HTMLInputElement).value).toBe(r.postalCode);
 for(const phone of ['081234567','08123456789','0212345678','abc']){fireEvent.change(screen.getByLabelText('เบอร์มือถือ'),{target:{value:phone}});expect(button.disabled).toBe(true);}
 fireEvent.change(screen.getByLabelText('เบอร์มือถือ'),{target:{value:'0812345678'}});expect(button.disabled).toBe(false);
 fireEvent.change(screen.getByLabelText('จังหวัด'),{target:{value:'50'}});expect(button.disabled).toBe(true);expect((screen.getByLabelText('อำเภอ') as unknown as HTMLSelectElement).value).toBe('');expect((screen.getByLabelText('ตำบล') as unknown as HTMLSelectElement).disabled).toBe(true);expect((screen.getByLabelText('รหัสไปรษณีย์') as HTMLInputElement).value).toBe('');
});
it('keeps preview form submission disabled even with all valid fields',()=>{render(<AddressForm canSubmit={false} onSubmit={vi.fn(async()=>{})}/>);expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);});

