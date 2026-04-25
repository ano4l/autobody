package com.autobody.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findTopByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);

    @Query("""
            select c from Customer c
            where (:search = ''
               or lower(coalesce(c.name, '')) like lower(concat('%', :search, '%'))
               or lower(coalesce(c.phone, '')) like lower(concat('%', :search, '%'))
               or lower(coalesce(c.email, '')) like lower(concat('%', :search, '%')))
              and (:source is null or c.source = :source)
            """)
    Page<Customer> search(@Param("search") String search,
                          @Param("source") CustomerSource source,
                          Pageable pageable);
}
