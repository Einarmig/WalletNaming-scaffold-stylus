// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

extern crate alloc;

use alloc::string::String;
use alloc::vec::Vec;
use alloc::vec;

/// Import items from the SDK. The prelude contains common traits and macros.
use stylus_sdk::{
    alloy_primitives::Address,
    alloy_sol_types::sol,
    prelude::*,
    evm
};

// Definir eventos
sol! {
    event NameRegistered(address indexed user, string name);
    event NameChanged(address indexed user, string oldName, string newName);
}

// Definir el storage
sol_storage! {
    #[entrypoint]
    pub struct WalletNaming {
        // Mapping de dirección a nombre
        mapping(address => string) users_naming;
        // Mapping de nombre a dirección (para búsqueda inversa)
        mapping(string => address) name_to_address;
    }
}

#[public]
impl WalletNaming {
    
    // Establecer nombre para el usuario
    pub fn set_name(&mut self, name: String) -> Result<(), Vec<u8>> {
        let caller = self.vm().msg_sender();
        
        // Validar que el nombre no esté vacío
        if name.is_empty() {
            return Err(b"Name cannot be empty".to_vec());
        }
        
        // Verificar si el nombre ya está tomado
        let current_owner = self.name_to_address.getter(name.clone()).get();
        if current_owner != Address::ZERO && current_owner != caller {
            return Err(b"Name already taken".to_vec());
        }
        
        // Si el usuario ya tenía un nombre, limpiarlo del mapping inverso
        let old_name = self.users_naming.getter(caller).get_string();
        if !old_name.is_empty() {
            self.name_to_address.setter(old_name.clone()).set(Address::ZERO);
            // Usar log desde el prelude
            evm::log(NameChanged {
                user: caller,
                oldName: old_name,
                newName: name.clone(),
            });
        } else {
            // Usar log desde el prelude
            evm::log(NameRegistered {
                user: caller,
                name: name.clone(),
            });
        }
        
        // Establecer el nuevo nombre
        self.users_naming.setter(caller).set_str(&name);
        // Establecer el mapping inverso
        self.name_to_address.setter(name).set(caller);
        
        Ok(())
    }
    
    // Obtener nombre de una dirección
    pub fn get_name(&self, user: Address) -> Result<String, Vec<u8>> {
        let stored_name = self.users_naming.getter(user).get_string();
        Ok(stored_name)
    }
    
    // Obtener dirección a partir de un nombre
    pub fn get_address_by_name(&self, name: String) -> Result<Address, Vec<u8>> {
        let address = self.name_to_address.getter(name).get();
        if address == Address::ZERO {
            return Err(b"User not found".to_vec());
        }
        Ok(address)
    }
    
    // Función helper para obtener la dirección y validar que existe
    pub fn resolve_name(&self, name: String) -> Result<Address, Vec<u8>> {
        if name.is_empty() {
            return Err(b"Name cannot be empty".to_vec());
        }
        
        let address = self.name_to_address.getter(name).get();
        if address == Address::ZERO {
            return Err(b"Name not registered".to_vec());
        }
        
        Ok(address)
    }
    
    // Verificar si un nombre está disponible
    pub fn is_name_available(&self, name: String) -> Result<bool, Vec<u8>> {
        if name.is_empty() {
            return Ok(false);
        }
        let owner = self.name_to_address.getter(name).get();
        Ok(owner == Address::ZERO)
    }
    
    // Eliminar/liberar tu propio nombre
    pub fn release_name(&mut self) -> Result<(), Vec<u8>> {
        let caller = self.vm().msg_sender();
        let name = self.users_naming.getter(caller).get_string();
        
        if name.is_empty() {
            return Err(b"No name to release".to_vec());
        }
        
        // Limpiar ambos mappings
        self.users_naming.setter(caller).set_str("");
        self.name_to_address.setter(name).set(Address::ZERO);
        
        Ok(())
    }
    
   
}

