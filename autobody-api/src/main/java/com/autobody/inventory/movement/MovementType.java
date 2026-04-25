package com.autobody.inventory.movement;

public enum MovementType {
    /** Stock leaves — customer sale. Decrements qty_on_hand. */
    SALE(-1),
    /** Stock arrives from a supplier. Increments qty_on_hand. */
    RECEIVE(1),
    /** Manual correction; qty can be positive or negative. */
    ADJUST(0),
    /** Write-off — damage, loss, theft. Decrements qty_on_hand. */
    WRITE_OFF(-1),
    /** Customer return — stock comes back. Increments qty_on_hand. */
    RETURN(1);

    private final int sign;

    MovementType(int sign) {
        this.sign = sign;
    }

    /**
     * Applies the movement's intrinsic sign to a positive quantity.
     * ADJUST passes the quantity through unchanged (caller supplies sign).
     */
    public int apply(int qty) {
        if (this == ADJUST) return qty;
        return sign * Math.abs(qty);
    }
}
