'''Universalnyy modul logistiki. Seychas — realistichnyy raschet po zonam/vesu.
V budushchem legko zamenit na CDEK/Boxberry/Pochta cherez edinyy interfeys calc_delivery().'''

# Bazovaya stoimost i sroki po zonam dostavki (zona iz tablicy cities)
ZONE_BASE = {
    1: {'pvz': 250, 'courier': 400, 'express': 900, 'pvz_days': (1, 2), 'courier_days': (1, 2), 'express_days': (1, 1)},
    2: {'pvz': 350, 'courier': 550, 'express': 1100, 'pvz_days': (2, 3), 'courier_days': (2, 3), 'express_days': (1, 2)},
    3: {'pvz': 450, 'courier': 690, 'express': 1290, 'pvz_days': (3, 5), 'courier_days': (3, 5), 'express_days': (2, 3)},
    4: {'pvz': 650, 'courier': 990, 'express': 1890, 'pvz_days': (5, 8), 'courier_days': (5, 8), 'express_days': (3, 5)},
}


def _weight_surcharge(total_weight_g):
    '''Nadbavka za ves sverh 5 kg: 40 rub za kazhduyu dopolnitelnuyu kg.'''
    kg = total_weight_g / 1000.0
    if kg <= 5:
        return 0
    return int((kg - 5) * 40)


def _volume_surcharge(total_volume_cm3):
    '''Nadbavka za bolshoy obem (napr. korpusa, gotovye PK).'''
    if total_volume_cm3 <= 40000:  # ~ 40 litrov
        return 0
    return int((total_volume_cm3 - 40000) / 1000 * 3)


def calc_delivery(zone, items):
    '''items: [{weight_g, length_mm, width_mm, height_mm, qty}]. Vozvrashchaet varianty dostavki.'''
    base = ZONE_BASE.get(zone, ZONE_BASE[3])
    total_weight = sum(i['weight_g'] * i.get('qty', 1) for i in items)
    total_volume = sum(
        (i['length_mm'] / 10.0) * (i['width_mm'] / 10.0) * (i['height_mm'] / 10.0) * i.get('qty', 1)
        for i in items
    )
    surcharge = _weight_surcharge(total_weight) + _volume_surcharge(total_volume)

    def days(d):
        return {'min': d[0], 'max': d[1]}

    return [
        {'code': 'pvz', 'provider': 'cdek', 'name': 'ПВЗ СДЭК', 'icon': 'MapPin',
         'price': base['pvz'] + surcharge, 'days': days(base['pvz_days'])},
        {'code': 'courier', 'provider': 'cdek', 'name': 'Курьер до двери', 'icon': 'Truck',
         'price': base['courier'] + surcharge, 'days': days(base['courier_days'])},
        {'code': 'express', 'provider': 'cdek', 'name': 'Экспресс-доставка', 'icon': 'Zap',
         'price': base['express'] + surcharge, 'days': days(base['express_days'])},
    ]
