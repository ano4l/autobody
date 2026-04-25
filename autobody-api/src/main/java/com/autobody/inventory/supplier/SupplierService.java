package com.autobody.inventory.supplier;

import com.autobody.inventory.supplier.dto.CreateSupplierRequest;
import com.autobody.inventory.supplier.dto.SupplierDTO;
import com.autobody.inventory.supplier.dto.UpdateSupplierRequest;
import com.autobody.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Transactional(readOnly = true)
    public Page<SupplierDTO> list(String search, Pageable pageable) {
        Page<Supplier> page = StringUtils.hasText(search)
                ? supplierRepository.findByNameContainingIgnoreCase(search, pageable)
                : supplierRepository.findAll(pageable);
        return page.map(supplierMapper::toDto);
    }

    @Transactional(readOnly = true)
    public SupplierDTO get(Long id) {
        return supplierMapper.toDto(findEntity(id));
    }

    @Transactional
    public SupplierDTO create(CreateSupplierRequest req) {
        Supplier s = Supplier.builder()
                .name(req.name())
                .contactName(req.contactName())
                .phone(req.phone())
                .email(req.email())
                .leadTimeDays(req.leadTimeDays() != null ? req.leadTimeDays() : 3)
                .notes(req.notes())
                .build();
        return supplierMapper.toDto(supplierRepository.save(s));
    }

    @Transactional
    public SupplierDTO update(Long id, UpdateSupplierRequest req) {
        Supplier s = findEntity(id);
        if (req.name() != null) s.setName(req.name());
        if (req.contactName() != null) s.setContactName(req.contactName());
        if (req.phone() != null) s.setPhone(req.phone());
        if (req.email() != null) s.setEmail(req.email());
        if (req.leadTimeDays() != null) s.setLeadTimeDays(req.leadTimeDays());
        if (req.notes() != null) s.setNotes(req.notes());
        return supplierMapper.toDto(supplierRepository.save(s));
    }

    @Transactional
    public void delete(Long id) {
        Supplier s = findEntity(id);
        supplierRepository.delete(s);
    }

    Supplier findEntity(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }
}
