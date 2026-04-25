package com.autobody.customer;

import com.autobody.customer.dto.CreateCustomerRequest;
import com.autobody.customer.dto.CustomerDTO;
import com.autobody.customer.dto.UpdateCustomerRequest;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Transactional(readOnly = true)
    public Page<CustomerDTO> list(String search, CustomerSource source, Pageable pageable) {
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : "";
        return customerRepository.search(normalizedSearch, source, pageable).map(customerMapper::toDto);
    }

    @Transactional(readOnly = true)
    public CustomerDTO get(Long id) {
        return customerMapper.toDto(findEntity(id));
    }

    @Transactional(readOnly = true)
    public CustomerDTO getByPhone(String phone) {
        String normalizedPhone = normalizePhone(phone);
        Customer customer = customerRepository.findByPhone(normalizedPhone)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", normalizedPhone));
        return customerMapper.toDto(customer);
    }

    @Transactional
    public CustomerDTO create(CreateCustomerRequest req) {
        String normalizedPhone = normalizePhone(req.phone());
        ensurePhoneUnique(normalizedPhone, null);

        Customer customer = Customer.builder()
                .name(req.name())
                .phone(normalizedPhone)
                .email(req.email())
                .vehicleMake(req.vehicleMake())
                .vehicleModel(req.vehicleModel())
                .vehicleYear(req.vehicleYear())
                .vehicleVin(req.vehicleVin())
                .source(req.source() != null ? req.source() : CustomerSource.WHATSAPP)
                .build();

        return customerMapper.toDto(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDTO update(Long id, UpdateCustomerRequest req) {
        Customer customer = findEntity(id);

        if (req.phone() != null) {
            String normalizedPhone = normalizePhone(req.phone());
            ensurePhoneUnique(normalizedPhone, id);
            customer.setPhone(normalizedPhone);
        }

        if (req.name() != null) customer.setName(req.name());
        if (req.email() != null) customer.setEmail(req.email());
        if (req.vehicleMake() != null) customer.setVehicleMake(req.vehicleMake());
        if (req.vehicleModel() != null) customer.setVehicleModel(req.vehicleModel());
        if (req.vehicleYear() != null) customer.setVehicleYear(req.vehicleYear());
        if (req.vehicleVin() != null) customer.setVehicleVin(req.vehicleVin());
        if (req.source() != null) customer.setSource(req.source());

        return customerMapper.toDto(customerRepository.save(customer));
    }

    private void ensurePhoneUnique(String phone, Long ignoreId) {
        customerRepository.findByPhone(phone)
                .filter(existing -> !existing.getId().equals(ignoreId))
                .ifPresent(existing -> {
                    throw new BusinessRuleException("CUSTOMER_PHONE_EXISTS",
                            "A customer with this phone number already exists");
                });
    }

    private String normalizePhone(String phone) {
        String value = phone != null ? phone.trim() : "";
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("Phone is required");
        }
        return value;
    }

    private Customer findEntity(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }
}
