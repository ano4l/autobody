package com.autobody.security;

public enum Role {
    ADMIN,
    SALESPERSON,
    WAREHOUSE,
    VIEW_ONLY;

    public String asAuthority() {
        return "ROLE_" + name();
    }
}
